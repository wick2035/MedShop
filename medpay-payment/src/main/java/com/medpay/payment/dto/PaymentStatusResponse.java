package com.medpay.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentStatusResponse {
    private String transactionNo;
    private String status;
    private BigDecimal totalAmount;
    private String paymentChannel;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
