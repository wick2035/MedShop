package com.medpay.payment.repository;

import com.medpay.payment.domain.SettlementRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettlementRecordRepository extends JpaRepository<SettlementRecord, UUID> {

    Optional<SettlementRecord> findBySettlementNo(String settlementNo);

    Page<SettlementRecord> findByHospitalId(UUID hospitalId, Pageable pageable);
}
