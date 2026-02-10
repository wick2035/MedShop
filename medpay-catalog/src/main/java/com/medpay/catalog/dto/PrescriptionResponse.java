package com.medpay.catalog.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PrescriptionResponse(
        UUID id,
        String prescriptionNo,
        UUID doctorId,
        UUID patientId,
        UUID appointmentId,
        String diagnosis,
        String diagnosisCode,
        String notes,
        BigDecimal totalAmount,
        BigDecimal insuranceAmount,
        BigDecimal selfPayAmount,
        String status,
        LocalDateTime validUntil,
        LocalDateTime createdAt,
        List<PrescriptionItemResponse> items
) {

    public record PrescriptionItemResponse(
            UUID id,
            UUID productId,
            String productName,
            String specification,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            String dosageInstruction,
            String frequency,
            Integer durationDays,
            boolean insuranceCovered,
            BigDecimal insuranceRatio
    ) {
    }
}
