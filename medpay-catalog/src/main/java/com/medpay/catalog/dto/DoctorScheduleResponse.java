package com.medpay.catalog.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleResponse(
        UUID id,
        UUID doctorId,
        UUID serviceId,
        LocalDate scheduleDate,
        LocalTime timeSlotStart,
        LocalTime timeSlotEnd,
        Integer maxPatients,
        Integer bookedCount,
        String status,
        LocalDateTime createdAt
) {
}
