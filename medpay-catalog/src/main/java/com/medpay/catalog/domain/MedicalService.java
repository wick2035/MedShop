package com.medpay.catalog.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medical_service")
@Getter
@Setter
@NoArgsConstructor
public class MedicalService extends TenantEntity {

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 50)
    private ServiceType serviceType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "insurance_covered")
    private Boolean insuranceCovered = false;

    @Column(name = "insurance_category", length = 50)
    private String insuranceCategory;

    @Column(name = "insurance_ratio", precision = 5, scale = 4)
    private BigDecimal insuranceRatio = BigDecimal.ZERO;

    @Column(name = "max_daily_quota")
    private Integer maxDailyQuota;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "jsonb")
    private List<String> imageUrls;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    private List<String> tags;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
}
