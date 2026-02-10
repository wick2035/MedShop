package com.medpay.payment.repository;

import com.medpay.payment.domain.PaymentLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentLedgerRepository extends JpaRepository<PaymentLedger, UUID> {

    Page<PaymentLedger> findByHospitalId(UUID hospitalId, Pageable pageable);

    List<PaymentLedger> findByReferenceTypeAndReferenceId(String referenceType, UUID referenceId);
}
