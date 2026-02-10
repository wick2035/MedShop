package com.medpay.catalog.dto;

import java.util.List;
import java.util.UUID;

public record ServiceCategoryResponse(
        UUID id,
        String name,
        String code,
        UUID parentId,
        String iconUrl,
        Integer sortOrder,
        String status,
        List<ServiceCategoryResponse> children
) {
}
