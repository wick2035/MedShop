package com.medpay.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LedgerResponse {
    private String ledgerNo;
    private String transactionType;
    private String direction;
    private String referenceType;
    private BigDecimal amount;
    private String description;
    private LocalDateTime createdAt;
}
