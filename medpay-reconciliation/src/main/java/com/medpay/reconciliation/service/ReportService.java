package com.medpay.reconciliation.service;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.payment.repository.RefundRecordRepository;
import com.medpay.reconciliation.dto.DashboardKpiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundRecordRepository refundRecordRepository;

    public DashboardKpiResponse getDashboardKpi(UUID hospitalId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        BigDecimal todayRevenue = paymentTransactionRepository.sumAmountByHospitalAndStatusAndPaidAtBetween(
                hospitalId, PaymentStatus.SUCCESS, todayStart, todayEnd);
        long todayOrders = paymentTransactionRepository.countByHospitalIdAndStatus(hospitalId, PaymentStatus.SUCCESS);

        BigDecimal monthRevenue = paymentTransactionRepository.sumAmountByHospitalAndStatusAndPaidAtBetween(
                hospitalId, PaymentStatus.SUCCESS, monthStart, todayEnd);

        return DashboardKpiResponse.builder()
                .todayRevenue(todayRevenue)
                .todayOrders(todayOrders)
                .todayRefunds(BigDecimal.ZERO)
                .pendingRefunds(0)
                .monthRevenue(monthRevenue)
                .monthOrders(todayOrders)
                .monthRefunds(BigDecimal.ZERO)
                .settlementPending(BigDecimal.ZERO)
                .build();
    }
}
