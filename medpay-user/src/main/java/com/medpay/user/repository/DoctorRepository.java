package com.medpay.user.repository;

import com.medpay.user.domain.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    Page<Doctor> findByHospitalId(UUID hospitalId, Pageable pageable);

    Page<Doctor> findByHospitalIdAndDepartmentId(UUID hospitalId, UUID departmentId, Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.hospitalId = :hospitalId AND d.status = 'ACTIVE' " +
           "AND (:specialty IS NULL OR d.specialty LIKE %:specialty%)")
    Page<Doctor> searchDoctors(UUID hospitalId, String specialty, Pageable pageable);
}
