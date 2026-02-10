package com.medpay.payment.service;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.event.OrderCancelledEvent;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.payment.statemachine.PaymentEvent;
import com.medpay.payment.statemachine.PaymentStateMachine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentStateMachine stateMachine;

    @EventListener
    @Transactional
    public void onOrderCancelled(OrderCancelledEvent event) {
        log.info("Received order cancelled event: orderId={}", event.getOrderId());

        List<PaymentTransaction> transactions = paymentTransactionRepository.findByOrderId(event.getOrderId());
        for (PaymentTransaction tx : transactions) {
            if (tx.getStatus() == PaymentStatus.PENDING || tx.getStatus() == PaymentStatus.PROCESSING) {
                try {
                    tx.setStatus(stateMachine.transition(tx.getStatus(), PaymentEvent.EXPIRED));
                    tx.setExpiredAt(LocalDateTime.now());
                    tx.setLastError("订单已取消: " + event.getCancelReason());
                    paymentTransactionRepository.save(tx);
                    log.info("Payment expired due to order cancel: txNo={}", tx.getTransactionNo());
                } catch (Exception e) {
                    log.warn("Could not expire payment: txNo={}, status={}", tx.getTransactionNo(), tx.getStatus());
                }
            }
        }
    }
}
