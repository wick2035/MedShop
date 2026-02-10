package com.medpay.catalog.domain;

import com.medpay.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "patient_package")
public class PatientPackage extends BaseEntity {

    @Column(name = "patient_id", nullable = false, columnDefinition = "uuid")
    private UUID patientId;

    @Column(name = "package_id", nullable = false, columnDefinition = "uuid")
    private UUID packageId;

    @Column(name = "order_id", columnDefinition = "uuid")
    private UUID orderId;

    @Column(name = "hospital_id", nullable = false, columnDefinition = "uuid")
    private UUID hospitalId;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "remaining_usage")
    private Integer remainingUsage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "usage_log", columnDefinition = "jsonb")
    private List<Map<String, Object>> usageLog;

    @Column(name = "status")
    private String status = "ACTIVE";
}
