package com.medpay.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record PrescriptionCreateRequest(
        @NotNull UUID patientId,
        UUID appointmentId,
        @NotBlank String diagnosis,
        String diagnosisCode,
        String notes,
        @NotEmpty List<@Valid PrescriptionItemRequest> items
) {
}
