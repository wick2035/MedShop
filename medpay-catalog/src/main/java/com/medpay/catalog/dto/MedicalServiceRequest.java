package com.medpay.catalog.dto;

import com.medpay.catalog.domain.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MedicalServiceRequest(
        UUID categoryId,
        UUID departmentId,
        @NotBlank String name,
        @NotBlank String code,
        @NotNull ServiceType serviceType,
        String description,
        @NotNull BigDecimal price,
        BigDecimal originalPrice,
        boolean insuranceCovered,
        String insuranceCategory,
        BigDecimal insuranceRatio,
        Integer maxDailyQuota,
        Integer durationMinutes,
        boolean requiresPrescription,
        List<String> imageUrls,
        List<String> tags,
        Integer sortOrder
) {
}
