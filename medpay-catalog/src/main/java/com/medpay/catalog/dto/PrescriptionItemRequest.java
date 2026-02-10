package com.medpay.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PrescriptionItemRequest(
        @NotNull UUID productId,
        @Min(1) int quantity,
        String dosageInstruction,
        String frequency,
        Integer durationDays
) {
}
