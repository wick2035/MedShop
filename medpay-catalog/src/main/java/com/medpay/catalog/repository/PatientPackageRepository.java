package com.medpay.catalog.repository;

import com.medpay.catalog.domain.PatientPackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientPackageRepository extends JpaRepository<PatientPackage, UUID> {

    List<PatientPackage> findByPatientIdAndStatus(UUID patientId, String status);

    Optional<PatientPackage> findByOrderId(UUID orderId);
}
