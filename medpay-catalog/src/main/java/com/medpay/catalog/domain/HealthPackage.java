package com.medpay.catalog.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "health_package", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"hospital_id", "code"})
})
public class HealthPackage extends TenantEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "package_type", nullable = false)
    private PackageType packageType;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "original_price")
    private BigDecimal originalPrice;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(name = "max_usage")
    private Integer maxUsage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "included_items", columnDefinition = "jsonb")
    private List<Map<String, Object>> includedItems;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "status")
    private String status = "ACTIVE";
}
