package com.medpay.catalog.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleRequest(
        @NotNull UUID doctorId,
        UUID serviceId,
        @NotNull LocalDate scheduleDate,
        @NotNull LocalTime timeSlotStart,
        @NotNull LocalTime timeSlotEnd,
        @NotNull Integer maxPatients
) {
}
