package com.medpay.catalog.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record ServiceCategoryRequest(
        @NotBlank String name,
        @NotBlank String code,
        UUID parentId,
        String iconUrl,
        Integer sortOrder
) {
}
