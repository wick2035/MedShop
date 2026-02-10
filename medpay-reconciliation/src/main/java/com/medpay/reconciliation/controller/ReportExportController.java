package com.medpay.reconciliation.controller;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.repository.PaymentTransactionRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportExportController {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @GetMapping("/export/csv")
    public void exportCsv(
            @RequestParam UUID hospitalId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            HttpServletResponse response) throws Exception {

        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition",
                "attachment; filename=payment_report_" + startDate + "_" + endDate + ".csv");

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<PaymentTransaction> transactions = paymentTransactionRepository
                .findByStatusAndCreatedAtBetween(PaymentStatus.SUCCESS, start, end);

        PrintWriter writer = response.getWriter();
        writer.println("交易号,订单号,金额,渠道,状态,支付时间");
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (PaymentTransaction tx : transactions) {
            if (tx.getHospitalId().equals(hospitalId)) {
                writer.printf("%s,%s,%s,%s,%s,%s%n",
                        tx.getTransactionNo(), tx.getOrderNo(), tx.getTotalAmount(),
                        tx.getPaymentChannel(), tx.getStatus(),
                        tx.getPaidAt() != null ? tx.getPaidAt().format(dtf) : "");
            }
        }
        writer.flush();
    }
}
