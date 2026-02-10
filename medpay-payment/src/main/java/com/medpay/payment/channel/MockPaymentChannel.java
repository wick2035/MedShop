package com.medpay.payment.channel;

import com.medpay.common.constant.PaymentChannelEnum;
import com.medpay.common.util.CryptoUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@ConditionalOnProperty(name = "medpay.payment.channel", havingValue = "mock")
public class MockPaymentChannel implements PaymentChannel {

    @Value("${medpay.payment.mock-secret:mock-secret-key}")
    private String mockSecret;

    private final Map<String, MockTransaction> mockStore = new ConcurrentHashMap<>();

    @Override
    public PaymentChannelEnum getChannelCode() {
        return PaymentChannelEnum.MOCK;
    }

    @Override
    public PrepayResult prepay(PrepayRequest request) {
        String channelTxId = "MOCK-" + UUID.randomUUID().toString().substring(0, 8);
        mockStore.put(request.getTransactionNo(), new MockTransaction(
                request.getTransactionNo(), channelTxId, request.getAmount(), "PENDING"));
        log.info("Mock prepay: txNo={}, channelTxId={}, amount={}",
                request.getTransactionNo(), channelTxId, request.getAmount());
        return PrepayResult.builder()
                .success(true)
                .channelTransactionId(channelTxId)
                .payUrl("/mock-pay/" + request.getTransactionNo())
                .build();
    }

    @Override
    public PaymentQueryResult queryPayment(String channelTransactionId) {
        return mockStore.values().stream()
                .filter(t -> t.channelTxId.equals(channelTransactionId))
                .findFirst()
                .map(t -> PaymentQueryResult.builder()
                        .status(t.status)
                        .paidAmount(t.amount)
                        .paidAt("SUCCESS".equals(t.status) ? LocalDateTime.now() : null)
                        .build())
                .orElse(PaymentQueryResult.builder().status("NOT_FOUND").build());
    }

    @Override
    public RefundResult refund(RefundRequest request) {
        String channelRefundId = "MOCK-REF-" + UUID.randomUUID().toString().substring(0, 8);
        log.info("Mock refund: refundNo={}, amount={}", request.getRefundNo(), request.getRefundAmount());
        return RefundResult.builder()
                .success(true)
                .channelRefundId(channelRefundId)
                .refundedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public boolean verifyCallback(String body, String signature) {
        String expected = CryptoUtil.hmacSha256(body, mockSecret);
        return expected.equals(signature);
    }

    @Override
    public PaymentCallbackData parseCallback(String body) {
        // In mock mode, body format is: transactionNo|amount|status
        String[] parts = body.split("\\|");
        return PaymentCallbackData.builder()
                .transactionNo(parts[0])
                .amount(new BigDecimal(parts[1]))
                .status(parts[2])
                .paidAt(LocalDateTime.now())
                .channelTransactionId(mockStore.containsKey(parts[0]) ?
                        mockStore.get(parts[0]).channelTxId : null)
                .build();
    }

    public void markAsPaid(String transactionNo) {
        MockTransaction tx = mockStore.get(transactionNo);
        if (tx != null) {
            tx.status = "SUCCESS";
        }
    }

    public MockTransaction getMockTransaction(String transactionNo) {
        return mockStore.get(transactionNo);
    }

    public static class MockTransaction {
        String transactionNo;
        String channelTxId;
        BigDecimal amount;
        String status;

        MockTransaction(String transactionNo, String channelTxId, BigDecimal amount, String status) {
            this.transactionNo = transactionNo;
            this.channelTxId = channelTxId;
            this.amount = amount;
            this.status = status;
        }
    }
}
