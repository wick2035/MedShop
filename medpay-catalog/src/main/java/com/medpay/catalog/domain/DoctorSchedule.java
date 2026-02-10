package com.medpay.catalog.domain;

import com.medpay.common.domain.TenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "doctor_schedule", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"doctor_id", "schedule_date", "time_slot_start"})
})
public class DoctorSchedule extends TenantEntity {

    @Column(name = "doctor_id", nullable = false, columnDefinition = "uuid")
    private UUID doctorId;

    @Column(name = "service_id", columnDefinition = "uuid")
    private UUID serviceId;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "time_slot_start", nullable = false)
    private LocalTime timeSlotStart;

    @Column(name = "time_slot_end", nullable = false)
    private LocalTime timeSlotEnd;

    @Column(name = "max_patients", nullable = false)
    private Integer maxPatients;

    @Column(name = "booked_count", nullable = false)
    private Integer bookedCount = 0;

    @Column(name = "status")
    private String status = "AVAILABLE";
}
