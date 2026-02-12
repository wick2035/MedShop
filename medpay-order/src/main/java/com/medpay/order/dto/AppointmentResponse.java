package com.medpay.order.dto;

import com.medpay.order.domain.Appointment;
import com.medpay.order.domain.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        String appointmentNo,
        UUID patientId,
        UUID doctorId,
        UUID scheduleId,
        UUID orderId,
        LocalDate appointmentDate,
        LocalTime timeSlotStart,
        LocalTime timeSlotEnd,
        Integer queueNumber,
        AppointmentStatus status,
        LocalDateTime checkInTime,
        LocalDateTime createdAt
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getAppointmentNo(),
                a.getPatientId(),
                a.getDoctorId(),
                a.getScheduleId(),
                a.getOrderId(),
                a.getAppointmentDate(),
                a.getTimeSlotStart(),
                a.getTimeSlotEnd(),
                a.getQueueNumber(),
                a.getStatus(),
                a.getCheckInTime(),
                a.getCreatedAt()
        );
    }
}
