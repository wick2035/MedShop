package com.medpay.insurance.repository;

import com.medpay.insurance.domain.Reimbursement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReimbursementRepository extends JpaRepository<Reimbursement, UUID> {
    Page<Reimbursement> findByPatientId(UUID patientId, Pageable pageable);
    Page<Reimbursement> findByHospitalId(UUID hospitalId, Pageable pageable);
}
