package com.medpay.insurance.repository;

import com.medpay.insurance.domain.InsuranceClaim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, UUID> {
    Optional<InsuranceClaim> findByClaimNo(String claimNo);
    Page<InsuranceClaim> findByHospitalId(UUID hospitalId, Pageable pageable);
    Page<InsuranceClaim> findByPatientId(UUID patientId, Pageable pageable);
    Optional<InsuranceClaim> findByOrderId(UUID orderId);
}
