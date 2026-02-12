package com.medpay.payment.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "refund_record")
@Getter
@Setter
@NoArgsConstructor
public class RefundRecord extends TenantEntity {

    @Column(name = "refund_no", nullable = false, unique = true, length = 50)
    private String refundNo;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "order_no", nullable = false, length = 50)
    private String orderNo;

    @Column(name = "payment_transaction_id", nullable = false)
    private UUID paymentTransactionId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "refund_type", nullable = false, length = 20)
    private String refundType;

    @Column(name = "refund_reason", nullable = false, columnDefinition = "TEXT")
    private String refundReason;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "insurance_refund_amount", precision = 12, scale = 2)
    private BigDecimal insuranceRefundAmount = BigDecimal.ZERO;

    @Column(name = "self_pay_refund_amount", precision = 12, scale = 2)
    private BigDecimal selfPayRefundAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_comment", columnDefinition = "TEXT")
    private String reviewComment;

    @Column(name = "channel_refund_id", length = 100)
    private String channelRefundId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "channel_response", columnDefinition = "jsonb")
    private String channelResponse;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;
}
