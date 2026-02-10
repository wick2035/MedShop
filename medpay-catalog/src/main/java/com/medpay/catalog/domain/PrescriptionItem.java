package com.medpay.catalog.domain;

import com.medpay.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "prescription_item")
public class PrescriptionItem extends BaseEntity {

    @Column(name = "prescription_id", nullable = false, columnDefinition = "uuid")
    private UUID prescriptionId;

    @Column(name = "product_id", nullable = false, columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "specification")
    private String specification;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;

    @Column(name = "dosage_instruction")
    private String dosageInstruction;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "insurance_covered")
    private boolean insuranceCovered;

    @Column(name = "insurance_ratio")
    private BigDecimal insuranceRatio;
}
