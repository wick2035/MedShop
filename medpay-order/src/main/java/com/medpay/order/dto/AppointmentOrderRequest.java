package com.medpay.order.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AppointmentOrderRequest(
        @NotNull UUID scheduleId,
        UUID doctorId
) {
}
