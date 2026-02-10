package com.medpay.hospital.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

/**
 * 创建/更新科室请求体
 */
public record DepartmentRequest(

        @NotBlank(message = "科室名称不能为空")
        String name,

        @NotBlank(message = "科室编码不能为空")
        String code,

        UUID parentId,

        String description,

        Integer sortOrder
) {
}
