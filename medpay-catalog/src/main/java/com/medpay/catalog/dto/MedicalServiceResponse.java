package com.medpay.catalog.dto;

import com.medpay.catalog.domain.ServiceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MedicalServiceResponse(
        UUID id,
        UUID hospitalId,
        UUID categoryId,
        UUID departmentId,
        String name,
        String code,
        ServiceType serviceType,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        boolean insuranceCovered,
        String insuranceCategory,
        BigDecimal insuranceRatio,
        Integer maxDailyQuota,
        Integer durationMinutes,
        boolean requiresPrescription,
        List<String> imageUrls,
        List<String> tags,
        Integer sortOrder,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
