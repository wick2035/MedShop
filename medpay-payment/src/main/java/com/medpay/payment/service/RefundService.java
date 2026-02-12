package com.medpay.payment.service;

import com.medpay.common.constant.PaymentChannelEnum;
import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.event.EventOutboxService;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantUtil;
import com.medpay.common.util.PostgresAdvisoryLock;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.order.domain.Order;
import com.medpay.order.domain.OrderItem;
import com.medpay.order.service.OrderService;
import com.medpay.order.statemachine.OrderEvent;
import com.medpay.catalog.service.ProductService;
import com.medpay.payment.channel.PaymentChannel;
import com.medpay.payment.channel.PaymentChannelFactory;
import com.medpay.payment.channel.RefundRequest;
import com.medpay.payment.channel.RefundResult;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.domain.RefundRecord;
import com.medpay.payment.dto.RefundApprovalRequest;
import com.medpay.payment.dto.RefundCreateRequest;
import com.medpay.payment.dto.RefundResponse;
import com.medpay.payment.event.RefundSuccessEvent;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.payment.repository.RefundRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRecordRepository refundRecordRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final PaymentChannelFactory channelFactory;
    private final SnowflakeIdGenerator idGenerator;
    private final PostgresAdvisoryLock advisoryLock;
    private final EventOutboxService eventOutboxService;
    private final PaymentLedgerService ledgerService;

    @Transactional
    public RefundResponse requestRefund(RefundCreateRequest request, UUID requestedBy, String idempotencyKey) {
        Order order = orderService.findOrderById(request.getOrderId());

        // Validate order can be refunded
        String status = order.getStatus();
        if (!"PAID".equals(status) && !"PARTIALLY_REFUNDED".equals(status)) {
            throw new BusinessException(ErrorCode.REFUND_NOT_ALLOWED, "当前订单状态不允许退款: " + status);
        }

        // Find the successful payment
        List<PaymentTransaction> payments = paymentTransactionRepository.findByOrderId(order.getId());
        PaymentTransaction payment = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS || p.getStatus() == PaymentStatus.SETTLED)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.REFUND_NOT_ALLOWED, "未找到成功的支付记录"));

        // Check total refund does not exceed payment
        BigDecimal totalRefunded = refundRecordRepository.sumApprovedRefundsByOrderId(order.getId());
        BigDecimal newTotal = totalRefunded.add(request.getRefundAmount());
        if (newTotal.compareTo(payment.getTotalAmount()) > 0) {
            throw new BusinessException(ErrorCode.REFUND_EXCEED_LIMIT,
                    String.format("退款总额%.2f超出支付金额%.2f", newTotal, payment.getTotalAmount()));
        }

        String refundNo = idGenerator.generateRefundNo();
        boolean isFullRefund = request.getRefundAmount().compareTo(
                payment.getTotalAmount().subtract(totalRefunded)) == 0;

        RefundRecord refund = new RefundRecord();
        refund.setHospitalId(order.getHospitalId());
        refund.setRefundNo(refundNo);
        refund.setOrderId(order.getId());
        refund.setOrderNo(order.getOrderNo());
        refund.setPaymentTransactionId(payment.getId());
        refund.setPatientId(order.getPatientId());
        refund.setRefundType(request.getRefundType());
        refund.setRefundReason(request.getRefundReason());
        refund.setRefundAmount(request.getRefundAmount());
        refund.setSelfPayRefundAmount(request.getRefundAmount());
        refund.setStatus("PENDING");
        refund.setRequestedBy(requestedBy);
        refund.setIdempotencyKey(idempotencyKey);
        refundRecordRepository.save(refund);

        // Update order status
        orderService.updateOrderStatus(order.getId(), OrderEvent.REQUEST_REFUND);

        log.info("Refund requested: refundNo={}, orderId={}, amount={}", refundNo, order.getId(), request.getRefundAmount());

        return toRefundResponse(refund);
    }

    @Transactional
    public RefundResponse approveRefund(UUID refundId, RefundApprovalRequest approvalRequest, UUID reviewedBy) {
        String lockKey = "refund:approve:" + refundId;
        if (!advisoryLock.tryLock(lockKey)) {
            throw new BusinessException(ErrorCode.CONCURRENT_OPERATION);
        }

        RefundRecord refund = refundRecordRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "退款记录不存在"));
        TenantUtil.verifyAccess(refund.getHospitalId());

        if (!"PENDING".equals(refund.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "退款状态不允许审批: " + refund.getStatus());
        }

        PaymentTransaction payment = paymentTransactionRepository.findById(refund.getPaymentTransactionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "支付记录不存在"));

        PaymentChannelEnum channelEnum = PaymentChannelEnum.valueOf(payment.getPaymentChannel());
        PaymentChannel channel = channelFactory.getChannel(channelEnum);

        RefundResult result = channel.refund(RefundRequest.builder()
                .channelTransactionId(payment.getChannelTransactionId())
                .refundNo(refund.getRefundNo())
                .refundAmount(refund.getRefundAmount())
                .totalAmount(payment.getTotalAmount())
                .reason(refund.getRefundReason())
                .build());

        refund.setReviewedBy(reviewedBy);
        refund.setReviewedAt(LocalDateTime.now());
        refund.setReviewComment(approvalRequest != null ? approvalRequest.getComment() : null);

        if (result.isSuccess()) {
            refund.setStatus("SUCCESS");
            refund.setChannelRefundId(result.getChannelRefundId());
            refund.setRefundedAt(result.getRefundedAt());
            refundRecordRepository.save(refund);

            // Update order status
            orderService.updateOrderStatus(refund.getOrderId(), OrderEvent.APPROVE_REFUND);
            orderService.updateOrderStatus(refund.getOrderId(), OrderEvent.REFUND_SUCCESS);

            // Record ledger credit
            ledgerService.recordRefund(refund, payment.getHospitalId());

            // Release stock for product items
            releaseOrderItemStock(refund.getOrderId());

            // Save domain event
            RefundSuccessEvent event = new RefundSuccessEvent(
                    refund.getOrderId(), refund.getRefundNo(),
                    refund.getRefundAmount(), refund.getRefundType());
            eventOutboxService.saveEvent(event);

            log.info("Refund approved and completed: refundNo={}", refund.getRefundNo());
        } else {
            refund.setStatus("FAILED");
            refundRecordRepository.save(refund);

            orderService.updateOrderStatus(refund.getOrderId(), OrderEvent.APPROVE_REFUND);
            orderService.updateOrderStatus(refund.getOrderId(), OrderEvent.REFUND_FAILED);

            log.warn("Refund channel failed: refundNo={}, error={}", refund.getRefundNo(), result.getErrorMessage());
        }

        return toRefundResponse(refund);
    }

    @Transactional
    public RefundResponse rejectRefund(UUID refundId, RefundApprovalRequest approvalRequest, UUID reviewedBy) {
        RefundRecord refund = refundRecordRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "退款记录不存在"));
        TenantUtil.verifyAccess(refund.getHospitalId());

        if (!"PENDING".equals(refund.getStatus())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_INVALID, "退款状态不允许拒绝: " + refund.getStatus());
        }

        refund.setStatus("REJECTED");
        refund.setReviewedBy(reviewedBy);
        refund.setReviewedAt(LocalDateTime.now());
        refund.setReviewComment(approvalRequest != null ? approvalRequest.getComment() : null);
        refundRecordRepository.save(refund);

        orderService.updateOrderStatus(refund.getOrderId(), OrderEvent.REJECT_REFUND);

        log.info("Refund rejected: refundNo={}", refund.getRefundNo());
        return toRefundResponse(refund);
    }

    @Transactional(readOnly = true)
    public RefundResponse getRefundById(UUID refundId) {
        RefundRecord refund = refundRecordRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "退款记录不存在"));
        return toRefundResponse(refund);
    }

    public Page<RefundResponse> getRefundsByHospital(UUID hospitalId, String status, Pageable pageable) {
        Page<RefundRecord> page;
        if (status != null && !status.isBlank()) {
            page = refundRecordRepository.findByHospitalIdAndStatus(hospitalId, status, pageable);
        } else {
            page = refundRecordRepository.findByHospitalId(hospitalId, pageable);
        }
        return page.map(this::toRefundResponse);
    }

    private void releaseOrderItemStock(UUID orderId) {
        try {
            Order order = orderService.findOrderById(orderId);
            for (OrderItem item : order.getItems()) {
                if ("PRODUCT".equals(item.getItemType())) {
                    productService.releaseStock(item.getReferenceId(), item.getQuantity());
                }
            }
        } catch (Exception e) {
            log.error("Failed to release stock for order: {}", orderId, e);
        }
    }

    private RefundResponse toRefundResponse(RefundRecord refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .refundNo(refund.getRefundNo())
                .orderNo(refund.getOrderNo())
                .status(refund.getStatus())
                .refundAmount(refund.getRefundAmount())
                .refundType(refund.getRefundType())
                .refundReason(refund.getRefundReason())
                .reviewComment(refund.getReviewComment())
                .reviewedAt(refund.getReviewedAt())
                .refundedAt(refund.getRefundedAt())
                .createdAt(refund.getCreatedAt())
                .build();
    }
}
