package com.medpay.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RefundResponse {
    private UUID id;
    private String refundNo;
    private String orderNo;
    private String status;
    private BigDecimal refundAmount;
    private String refundType;
    private String refundReason;
    private String reviewComment;
    private LocalDateTime reviewedAt;
    private LocalDateTime refundedAt;
    private LocalDateTime createdAt;
}
