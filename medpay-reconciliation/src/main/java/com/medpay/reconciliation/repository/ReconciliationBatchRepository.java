package com.medpay.reconciliation.repository;

import com.medpay.reconciliation.domain.ReconciliationBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReconciliationBatchRepository extends JpaRepository<ReconciliationBatch, UUID> {
    Page<ReconciliationBatch> findByHospitalId(UUID hospitalId, Pageable pageable);
    Optional<ReconciliationBatch> findByBatchNo(String batchNo);
    Optional<ReconciliationBatch> findByReconciliationDateAndChannel(LocalDate date, String channel);
    Page<ReconciliationBatch> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
