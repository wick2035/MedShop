package com.medpay.catalog.dto;

import com.medpay.catalog.domain.PackageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record HealthPackageRequest(
        @NotBlank String name,
        @NotBlank String code,
        String description,
        @NotNull PackageType packageType,
        @NotNull BigDecimal price,
        BigDecimal originalPrice,
        Integer validityDays,
        Integer maxUsage,
        List<Map<String, Object>> includedItems,
        String imageUrl,
        Integer sortOrder
) {
}
