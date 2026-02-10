package com.medpay.reconciliation.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReconciliationBatchResponse {
    private UUID id;
    private String batchNo;
    private LocalDate reconciliationDate;
    private String channel;
    private int systemTransactionCount;
    private int channelTransactionCount;
    private int matchedCount;
    private int mismatchedCount;
    private int missingInSystem;
    private int missingInChannel;
    private BigDecimal systemTotalAmount;
    private BigDecimal channelTotalAmount;
    private BigDecimal differenceAmount;
    private String status;
    private LocalDateTime completedAt;
}
