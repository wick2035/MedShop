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
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
public class Product extends TenantEntity {

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 50)
    private ProductType productType;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "specification", length = 200)
    private String specification;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 10;

    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = false;

    @Column(name = "insurance_covered")
    private Boolean insuranceCovered = false;

    @Column(name = "insurance_category", length = 50)
    private String insuranceCategory;

    @Column(name = "insurance_ratio", precision = 5, scale = 4)
    private BigDecimal insuranceRatio = BigDecimal.ZERO;

    @Column(name = "contraindications", columnDefinition = "TEXT")
    private String contraindications;

    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffects;

    @Column(name = "storage_conditions", length = 200)
    private String storageConditions;

    @Column(name = "expiry_warning_days")
    private Integer expiryWarningDays = 90;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "jsonb")
    private List<String> imageUrls;

    @Column(name = "barcode", length = 50)
    private String barcode;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
}
