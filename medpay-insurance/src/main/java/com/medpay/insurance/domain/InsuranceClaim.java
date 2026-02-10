package com.medpay.insurance.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "insurance_claim")
@Getter
@Setter
@NoArgsConstructor
public class InsuranceClaim extends TenantEntity {

    @Column(name = "claim_no", nullable = false, unique = true, length = 50)
    private String claimNo;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "insurance_type", nullable = false, length = 50)
    private String insuranceType;

    @Column(name = "insurance_number", nullable = false, length = 100)
    private String insuranceNumber;

    @Column(name = "insurance_region", length = 100)
    private String insuranceRegion;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "eligible_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal eligibleAmount;

    @Column(name = "deductible_amount", precision = 12, scale = 2)
    private BigDecimal deductibleAmount = BigDecimal.ZERO;

    @Column(name = "coverage_ratio", nullable = false, precision = 5, scale = 4)
    private BigDecimal coverageRatio;

    @Column(name = "insurance_pays", nullable = false, precision = 12, scale = 2)
    private BigDecimal insurancePays;

    @Column(name = "patient_copay", nullable = false, precision = 12, scale = 2)
    private BigDecimal patientCopay;

    @Column(name = "item_breakdown", columnDefinition = "jsonb")
    private String itemBreakdown = "[]";

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "external_claim_id", length = 100)
    private String externalClaimId;

    @Column(name = "external_response", columnDefinition = "jsonb")
    private String externalResponse;
}
