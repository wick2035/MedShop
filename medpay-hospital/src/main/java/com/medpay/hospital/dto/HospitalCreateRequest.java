package com.medpay.hospital.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 创建医院请求体
 */
public record HospitalCreateRequest(

        @NotBlank(message = "医院名称不能为空")
        String name,

        @NotBlank(message = "医院编码不能为空")
        String code,

        String licenseNumber,

        String address,

        String city,

        String province,

        String contactPhone,

        String contactEmail,

        String logoUrl,

        String timezone
) {
}
