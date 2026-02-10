package com.medpay.order.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "appointment")
public class Appointment extends TenantEntity {

    @Column(name = "appointment_no", unique = true, nullable = false)
    private String appointmentNo;

    @Column(name = "patient_id", columnDefinition = "uuid")
    private UUID patientId;

    @Column(name = "doctor_id", columnDefinition = "uuid")
    private UUID doctorId;

    @Column(name = "schedule_id", columnDefinition = "uuid")
    private UUID scheduleId;

    @Column(name = "order_id", columnDefinition = "uuid")
    private UUID orderId;

    @Column(name = "department_id", columnDefinition = "uuid")
    private UUID departmentId;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "time_slot_start")
    private LocalTime timeSlotStart;

    @Column(name = "time_slot_end")
    private LocalTime timeSlotEnd;

    @Column(name = "queue_number")
    private Integer queueNumber;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AppointmentStatus status;
}
