package com.medpay.reconciliation.repository;

import com.medpay.reconciliation.domain.ReconciliationDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReconciliationDetailRepository extends JpaRepository<ReconciliationDetail, UUID> {
    List<ReconciliationDetail> findByBatchId(UUID batchId);
    Page<ReconciliationDetail> findByBatchId(UUID batchId, Pageable pageable);
    Page<ReconciliationDetail> findByBatchIdAndMatchStatus(UUID batchId, String matchStatus, Pageable pageable);
}
