package com.medpay.payment.service;

import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.payment.domain.PaymentLedger;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.domain.RefundRecord;
import com.medpay.payment.domain.SettlementRecord;
import com.medpay.payment.dto.LedgerResponse;
import com.medpay.payment.repository.PaymentLedgerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentLedgerService {

    private final PaymentLedgerRepository ledgerRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Transactional
    public void recordPayment(PaymentTransaction transaction) {
        PaymentLedger ledger = new PaymentLedger();
        ledger.setHospitalId(transaction.getHospitalId());
        ledger.setLedgerNo(idGenerator.generateLedgerNo());
        ledger.setTransactionType("PAYMENT");
        ledger.setDirection("DEBIT");
        ledger.setReferenceType("PAYMENT_TRANSACTION");
        ledger.setReferenceId(transaction.getId());
        ledger.setAmount(transaction.getTotalAmount());
        ledger.setDescription("支付入账: " + transaction.getTransactionNo());
        ledgerRepository.save(ledger);

        log.info("Ledger recorded - payment: txNo={}, amount={}", transaction.getTransactionNo(), transaction.getTotalAmount());
    }

    @Transactional
    public void recordRefund(RefundRecord refund, UUID hospitalId) {
        PaymentLedger ledger = new PaymentLedger();
        ledger.setHospitalId(hospitalId);
        ledger.setLedgerNo(idGenerator.generateLedgerNo());
        ledger.setTransactionType("REFUND");
        ledger.setDirection("CREDIT");
        ledger.setReferenceType("REFUND_RECORD");
        ledger.setReferenceId(refund.getId());
        ledger.setAmount(refund.getRefundAmount());
        ledger.setDescription("退款出账: " + refund.getRefundNo());
        ledgerRepository.save(ledger);

        log.info("Ledger recorded - refund: refundNo={}, amount={}", refund.getRefundNo(), refund.getRefundAmount());
    }

    @Transactional
    public void recordSettlement(SettlementRecord settlement) {
        PaymentLedger ledger = new PaymentLedger();
        ledger.setHospitalId(settlement.getHospitalId());
        ledger.setLedgerNo(idGenerator.generateLedgerNo());
        ledger.setTransactionType("SETTLEMENT");
        ledger.setDirection("CREDIT");
        ledger.setReferenceType("SETTLEMENT_RECORD");
        ledger.setReferenceId(settlement.getId());
        ledger.setAmount(settlement.getNetAmount());
        ledger.setDescription("结算: " + settlement.getSettlementNo());
        ledgerRepository.save(ledger);

        log.info("Ledger recorded - settlement: stlNo={}, amount={}", settlement.getSettlementNo(), settlement.getNetAmount());
    }

    public Page<LedgerResponse> getLedger(UUID hospitalId, Pageable pageable) {
        return ledgerRepository.findByHospitalId(hospitalId, pageable)
                .map(this::toLedgerResponse);
    }

    private LedgerResponse toLedgerResponse(PaymentLedger ledger) {
        return LedgerResponse.builder()
                .ledgerNo(ledger.getLedgerNo())
                .transactionType(ledger.getTransactionType())
                .direction(ledger.getDirection())
                .referenceType(ledger.getReferenceType())
                .amount(ledger.getAmount())
                .description(ledger.getDescription())
                .createdAt(ledger.getCreatedAt())
                .build();
    }
}
