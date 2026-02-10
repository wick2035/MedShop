package com.medpay.hospital.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 医院响应体
 */
public record HospitalResponse(

        UUID id,

        String name,

        String code,

        String licenseNumber,

        String address,

        String city,

        String province,

        String contactPhone,

        String contactEmail,

        String logoUrl,

        String status,

        String subscriptionTier,

        String configJson,

        String timezone,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}
