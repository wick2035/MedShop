package com.medpay.hospital.dto;

/**
 * 更新医院请求体 — 所有字段均为可选，仅更新非 null 的字段
 */
public record HospitalUpdateRequest(

        String name,

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
