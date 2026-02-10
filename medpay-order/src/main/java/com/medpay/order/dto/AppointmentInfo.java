package com.medpay.order.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AppointmentInfo(
        UUID scheduleId,
        LocalDate appointmentDate
) {
}
