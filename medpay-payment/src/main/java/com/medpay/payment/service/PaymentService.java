package com.medpay.payment.service;

import com.medpay.common.constant.PaymentChannelEnum;
import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.event.EventOutboxService;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.util.PostgresAdvisoryLock;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.order.domain.Order;
import com.medpay.order.service.OrderService;
import com.medpay.order.statemachine.OrderEvent;
import com.medpay.payment.channel.*;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.dto.PaymentInitiateRequest;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.dto.PaymentStatusResponse;
import com.medpay.payment.event.PaymentSuccessEvent;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.payment.statemachine.PaymentEvent;
import com.medpay.payment.statemachine.PaymentStateMachine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;
    private final PaymentChannelFactory channelFactory;
    private final PaymentStateMachine stateMachine;
    private final SnowflakeIdGenerator idGenerator;
    private final PostgresAdvisoryLock advisoryLock;
    private final EventOutboxService eventOutboxService;
    private final PaymentLedgerService ledgerService;

    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, String idempotencyKey) {
        String lockKey = "payment:order:" + request.getOrderId();
        if (!advisoryLock.tryLock(lockKey)) {
            throw new BusinessException(ErrorCode.CONCURRENT_OPERATION);
        }

        Order order = orderService.findOrderById(request.getOrderId());

        // Validate order status
        if (!"PENDING_PAYMENT".equals(order.getStatus()) && !"CREATED".equals(order.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID,
                    "订单状态不允许支付: " + order.getStatus());
        }

        // Check for duplicate payment
        List<PaymentTransaction> existing = paymentTransactionRepository.findByOrderId(order.getId());
        for (PaymentTransaction tx : existing) {
            if (tx.getStatus() == PaymentStatus.SUCCESS) {
                throw new BusinessException(ErrorCode.PAYMENT_DUPLICATE);
            }
            if (tx.getStatus() == PaymentStatus.PROCESSING) {
                throw new BusinessException(ErrorCode.PAYMENT_DUPLICATE, "支付正在处理中");
            }
        }

        // Transition order to PENDING_PAYMENT if CREATED
        if ("CREATED".equals(order.getStatus())) {
            orderService.updateOrderStatus(order.getId(), OrderEvent.SUBMIT_PAYMENT);
        }

        PaymentChannelEnum channelEnum = PaymentChannelEnum.valueOf(request.getPaymentChannel());
        PaymentChannel channel = channelFactory.getChannel(channelEnum);

        String transactionNo = idGenerator.generatePaymentNo();

        // Create payment transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setHospitalId(order.getHospitalId());
        transaction.setTransactionNo(transactionNo);
        transaction.setOrderId(order.getId());
        transaction.setOrderNo(order.getOrderNo());
        transaction.setPatientId(order.getPatientId());
        transaction.setPaymentType("SELF_PAY");
        transaction.setPaymentChannel(channelEnum.name());
        transaction.setTotalAmount(order.getSelfPayAmount().compareTo(java.math.BigDecimal.ZERO) > 0
                ? order.getSelfPayAmount() : order.getTotalAmount());
        transaction.setInsuranceAmount(order.getInsuranceAmount());
        transaction.setSelfPayAmount(order.getSelfPayAmount().compareTo(java.math.BigDecimal.ZERO) > 0
                ? order.getSelfPayAmount() : order.getTotalAmount());
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setIdempotencyKey(idempotencyKey);
        transaction.setExpiredAt(LocalDateTime.now().plusMinutes(30));
        paymentTransactionRepository.save(transaction);

        // Call payment channel
        PrepayResult result = channel.prepay(PrepayRequest.builder()
                .transactionNo(transactionNo)
                .amount(transaction.getTotalAmount())
                .description("MedPay订单-" + order.getOrderNo())
                .notifyUrl("/api/v1/payments/callback/" + channelEnum.name())
                .expireMinutes(30)
                .build());

        if (!result.isSuccess()) {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setLastError(result.getErrorMessage());
            paymentTransactionRepository.save(transaction);
            throw new BusinessException(ErrorCode.PAYMENT_CHANNEL_ERROR, result.getErrorMessage());
        }

        // Update to PROCESSING
        transaction.setStatus(stateMachine.transition(PaymentStatus.PENDING, PaymentEvent.SUBMIT));
        transaction.setChannelTransactionId(result.getChannelTransactionId());
        paymentTransactionRepository.save(transaction);

        // Update order to PAYING
        orderService.updateOrderStatus(order.getId(), OrderEvent.BEGIN_PAYING);

        log.info("Payment initiated: txNo={}, orderId={}, amount={}", transactionNo, order.getId(), transaction.getTotalAmount());

        return PaymentInitiateResponse.builder()
                .transactionNo(transactionNo)
                .payUrl(result.getPayUrl())
                .qrCodeUrl(result.getQrCodeUrl())
                .expiresAt(transaction.getExpiredAt())
                .build();
    }

    @Transactional
    public void handlePaymentCallback(String channelCode, String body, String signature) {
        PaymentChannelEnum channelEnum = PaymentChannelEnum.valueOf(channelCode);
        PaymentChannel channel = channelFactory.getChannel(channelEnum);

        if (!channel.verifyCallback(body, signature)) {
            throw new BusinessException(ErrorCode.PAYMENT_CALLBACK_INVALID);
        }

        PaymentCallbackData callbackData = channel.parseCallback(body);

        PaymentTransaction transaction = paymentTransactionRepository
                .findByTransactionNo(callbackData.getTransactionNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "支付交易不存在"));

        // Idempotent: already succeeded
        if (transaction.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment already succeeded, skip callback: txNo={}", transaction.getTransactionNo());
            return;
        }

        String lockKey = "payment:callback:" + transaction.getTransactionNo();
        if (!advisoryLock.tryLock(lockKey)) {
            throw new BusinessException(ErrorCode.CONCURRENT_OPERATION);
        }

        // Validate amount
        if (callbackData.getAmount().compareTo(transaction.getTotalAmount()) != 0) {
            log.error("Payment amount mismatch: expected={}, actual={}, txNo={}",
                    transaction.getTotalAmount(), callbackData.getAmount(), transaction.getTransactionNo());
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        if ("SUCCESS".equals(callbackData.getStatus())) {
            transaction.setStatus(stateMachine.transition(transaction.getStatus(), PaymentEvent.CHANNEL_SUCCESS));
            transaction.setPaidAt(callbackData.getPaidAt() != null ? callbackData.getPaidAt() : LocalDateTime.now());
            transaction.setChannelTransactionId(callbackData.getChannelTransactionId());
            paymentTransactionRepository.save(transaction);

            // Update order status
            orderService.updateOrderStatus(transaction.getOrderId(), OrderEvent.PAYMENT_SUCCESS);

            // Record ledger
            ledgerService.recordPayment(transaction);

            // Save domain event
            PaymentSuccessEvent event = new PaymentSuccessEvent(
                    transaction.getOrderId(), transaction.getTransactionNo(),
                    transaction.getTotalAmount(), transaction.getPatientId());
            eventOutboxService.saveEvent(event);

            log.info("Payment success callback: txNo={}, orderId={}", transaction.getTransactionNo(), transaction.getOrderId());
        } else {
            transaction.setStatus(stateMachine.transition(transaction.getStatus(), PaymentEvent.CHANNEL_FAILED));
            transaction.setLastError("Channel returned: " + callbackData.getStatus());
            paymentTransactionRepository.save(transaction);

            orderService.updateOrderStatus(transaction.getOrderId(), OrderEvent.PAYMENT_FAILED);
            log.warn("Payment failed callback: txNo={}", transaction.getTransactionNo());
        }
    }

    public PaymentStatusResponse queryPaymentStatus(String transactionNo) {
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionNo(transactionNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "支付交易不存在"));

        return PaymentStatusResponse.builder()
                .transactionNo(transaction.getTransactionNo())
                .status(transaction.getStatus().name())
                .totalAmount(transaction.getTotalAmount())
                .paymentChannel(transaction.getPaymentChannel())
                .paidAt(transaction.getPaidAt())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public PaymentTransaction getByTransactionNo(String transactionNo) {
        return paymentTransactionRepository.findByTransactionNo(transactionNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "支付交易不存在"));
    }

    public List<PaymentTransaction> getByOrderId(UUID orderId) {
        return paymentTransactionRepository.findByOrderId(orderId);
    }
}
