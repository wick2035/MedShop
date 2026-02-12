package com.medpay.catalog.repository;

import com.medpay.catalog.domain.DoctorSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {

    List<DoctorSchedule> findByDoctorIdAndScheduleDate(UUID doctorId, LocalDate date);

    Page<DoctorSchedule> findByDoctorIdAndStatus(UUID doctorId, String status, Pageable pageable);

    Page<DoctorSchedule> findByDoctorIdAndStatusAndScheduleDate(UUID doctorId, String status, LocalDate scheduleDate, Pageable pageable);

    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.hospitalId = :hid " +
            "AND ds.scheduleDate = :date AND ds.status = 'AVAILABLE'")
    Page<DoctorSchedule> findAvailable(@Param("hid") UUID hospitalId,
                                       @Param("date") LocalDate date,
                                       Pageable pageable);

    @Modifying
    @Query("UPDATE DoctorSchedule d SET d.bookedCount = d.bookedCount + 1 " +
            "WHERE d.id = :id AND d.bookedCount < d.maxPatients")
    int bookSlot(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE DoctorSchedule d SET d.bookedCount = d.bookedCount - 1 " +
            "WHERE d.id = :id AND d.bookedCount > 0")
    int releaseSlot(@Param("id") UUID id);
}
