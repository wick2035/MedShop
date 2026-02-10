package com.medpay.hospital.dto;

import java.util.List;
import java.util.UUID;

/**
 * 科室响应体（支持递归树形结构）
 */
public record DepartmentResponse(

        UUID id,

        String name,

        String code,

        UUID parentId,

        String description,

        Integer sortOrder,

        String status,

        List<DepartmentResponse> children
) {
}
