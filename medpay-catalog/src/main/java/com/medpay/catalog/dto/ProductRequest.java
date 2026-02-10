package com.medpay.catalog.dto;

import com.medpay.catalog.domain.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductRequest(
        UUID categoryId,
        @NotBlank String name,
        @NotBlank String code,
        @NotNull ProductType productType,
        String genericName,
        String manufacturer,
        String specification,
        String unit,
        @NotNull BigDecimal price,
        BigDecimal costPrice,
        Integer stockQuantity,
        Integer lowStockThreshold,
        boolean requiresPrescription,
        boolean insuranceCovered,
        String insuranceCategory,
        BigDecimal insuranceRatio,
        String contraindications,
        String sideEffects,
        String storageConditions,
        Integer expiryWarningDays,
        List<String> imageUrls,
        String barcode
) {
}
