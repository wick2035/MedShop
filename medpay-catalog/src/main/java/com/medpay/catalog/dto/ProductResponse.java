package com.medpay.catalog.dto;

import com.medpay.catalog.domain.ProductType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        UUID hospitalId,
        UUID categoryId,
        String name,
        String code,
        ProductType productType,
        String genericName,
        String manufacturer,
        String specification,
        String unit,
        BigDecimal price,
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
        String barcode,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
