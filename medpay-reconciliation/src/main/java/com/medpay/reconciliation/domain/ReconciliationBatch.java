package com.medpay.reconciliation.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reconciliation_batch")
@Getter
@Setter
@NoArgsConstructor
public class ReconciliationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "batch_no", nullable = false, unique = true, length = 50)
    private String batchNo;

    @Column(name = "reconciliation_date", nullable = false)
    private LocalDate reconciliationDate;

    @Column(name = "channel", length = 30)
    private String channel;

    @Column(name = "system_transaction_count", nullable = false)
    private Integer systemTransactionCount = 0;

    @Column(name = "channel_transaction_count", nullable = false)
    private Integer channelTransactionCount = 0;

    @Column(name = "matched_count", nullable = false)
    private Integer matchedCount = 0;

    @Column(name = "mismatched_count", nullable = false)
    private Integer mismatchedCount = 0;

    @Column(name = "missing_in_system", nullable = false)
    private Integer missingInSystem = 0;

    @Column(name = "missing_in_channel", nullable = false)
    private Integer missingInChannel = 0;

    @Column(name = "system_total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal systemTotalAmount = BigDecimal.ZERO;

    @Column(name = "channel_total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal channelTotalAmount = BigDecimal.ZERO;

    @Column(name = "difference_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal differenceAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "exception_details", columnDefinition = "jsonb")
    private String exceptionDetails;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
