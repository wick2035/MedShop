package com.medpay.reconciliation.service;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.payment.domain.SettlementRecord;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.payment.repository.RefundRecordRepository;
import com.medpay.payment.repository.SettlementRecordRepository;
import com.medpay.payment.service.PaymentLedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRecordRepository settlementRecordRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundRecordRepository refundRecordRepository;
    private final PaymentLedgerService ledgerService;
    private final SnowflakeIdGenerator idGenerator;

    @Value("${medpay.payment.platform-fee-rate:0.006}")
    private BigDecimal platformFeeRate;

    @Transactional
    public SettlementRecord generateSettlement(UUID hospitalId, LocalDate periodStart, LocalDate periodEnd) {
        LocalDateTime start = periodStart.atStartOfDay();
        LocalDateTime end = periodEnd.atTime(LocalTime.MAX);

        BigDecimal grossAmount = paymentTransactionRepository.sumAmountByHospitalAndStatusAndPaidAtBetween(
                hospitalId, PaymentStatus.SUCCESS, start, end);

        long txCount = paymentTransactionRepository.countByHospitalIdAndStatusAndPaidAtBetween(
                hospitalId, PaymentStatus.SUCCESS, start, end);

        BigDecimal refundAmount = refundRecordRepository.sumRefundsByHospitalAndRefundedAtBetween(
                hospitalId, start, end);

        BigDecimal platformFee = grossAmount.multiply(platformFeeRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netAmount = grossAmount.subtract(refundAmount).subtract(platformFee);

        SettlementRecord settlement = new SettlementRecord();
        settlement.setHospitalId(hospitalId);
        settlement.setSettlementNo(idGenerator.generateSettlementNo());
        settlement.setSettlementPeriodStart(periodStart);
        settlement.setSettlementPeriodEnd(periodEnd);
        settlement.setTotalTransactions((int) txCount);
        settlement.setGrossAmount(grossAmount);
        settlement.setRefundAmount(refundAmount);
        settlement.setPlatformFee(platformFee);
        settlement.setNetAmount(netAmount);
        settlement.setStatus("PENDING");
        settlementRecordRepository.save(settlement);

        log.info("Settlement generated: stlNo={}, gross={}, net={}", settlement.getSettlementNo(), grossAmount, netAmount);
        return settlement;
    }

    public Page<SettlementRecord> getSettlements(UUID hospitalId, Pageable pageable) {
        return settlementRecordRepository.findByHospitalId(hospitalId, pageable);
    }

    @Transactional
    public SettlementRecord confirmSettlement(UUID settlementId) {
        SettlementRecord settlement = settlementRecordRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("结算记录不存在"));

        settlement.setStatus("SETTLED");
        settlement.setSettledAt(LocalDateTime.now());
        settlementRecordRepository.save(settlement);

        ledgerService.recordSettlement(settlement);

        log.info("Settlement confirmed: stlNo={}", settlement.getSettlementNo());
        return settlement;
    }
}
