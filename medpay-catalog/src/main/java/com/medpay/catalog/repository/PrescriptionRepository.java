package com.medpay.catalog.repository;

import com.medpay.catalog.domain.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByPrescriptionNo(String prescriptionNo);

    Page<Prescription> findByPatientIdOrderByCreatedAtDesc(UUID patientId, Pageable pageable);

    Page<Prescription> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId, Pageable pageable);
}
