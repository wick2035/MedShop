package com.medpay.reconciliation.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reconciliation_detail")
@Getter
@Setter
@NoArgsConstructor
public class ReconciliationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "batch_id", nullable = false)
    private UUID batchId;

    @Column(name = "payment_transaction_id")
    private UUID paymentTransactionId;

    @Column(name = "channel_transaction_id", length = 100)
    private String channelTransactionId;

    @Column(name = "system_amount", precision = 12, scale = 2)
    private BigDecimal systemAmount;

    @Column(name = "channel_amount", precision = 12, scale = 2)
    private BigDecimal channelAmount;

    @Column(name = "match_status", nullable = false, length = 20)
    private String matchStatus;

    @Column(name = "resolution_status", length = 20)
    private String resolutionStatus = "UNRESOLVED";

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
