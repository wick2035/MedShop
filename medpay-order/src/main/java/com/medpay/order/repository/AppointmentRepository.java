package com.medpay.order.repository;

import com.medpay.order.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Optional<Appointment> findByOrderId(UUID orderId);

    Optional<Appointment> findByAppointmentNo(String appointmentNo);

    List<Appointment> findByPatientIdAndAppointmentDateOrderByTimeSlotStart(UUID patientId, LocalDate date);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByQueueNumber(UUID doctorId, LocalDate appointmentDate);

    @Query("SELECT COALESCE(MAX(a.queueNumber), 0) FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate = :date")
    int findMaxQueueNumber(@Param("doctorId") UUID doctorId, @Param("date") LocalDate date);
}
