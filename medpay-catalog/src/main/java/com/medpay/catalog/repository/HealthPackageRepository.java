package com.medpay.catalog.repository;

import com.medpay.catalog.domain.HealthPackage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HealthPackageRepository extends JpaRepository<HealthPackage, UUID> {

    Page<HealthPackage> findByHospitalIdAndStatus(UUID hospitalId, String status, Pageable pageable);

    Optional<HealthPackage> findByHospitalIdAndCode(UUID hospitalId, String code);
}
