package com.medpay.catalog.dto;

import com.medpay.catalog.domain.PackageType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record HealthPackageResponse(
        UUID id,
        UUID hospitalId,
        String name,
        String code,
        String description,
        PackageType packageType,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer validityDays,
        Integer maxUsage,
        List<Map<String, Object>> includedItems,
        String imageUrl,
        Integer sortOrder,
        String status,
        LocalDateTime createdAt
) {
}
