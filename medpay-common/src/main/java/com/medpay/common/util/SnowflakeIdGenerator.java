package com.medpay.common.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class SnowflakeIdGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final AtomicLong sequence = new AtomicLong(
            System.nanoTime() % 10000000
    );

    public String generateOrderNo() {
        return generate("ORD");
    }

    public String generatePaymentNo() {
        return generate("PAY");
    }

    public String generateRefundNo() {
        return generate("REF");
    }

    public String generateSettlementNo() {
        return generate("STL");
    }

    public String generateClaimNo() {
        return generate("CLM");
    }

    public String generatePrescriptionNo() {
        return generate("PRE");
    }

    public String generateAppointmentNo() {
        return generate("APT");
    }

    public String generateBatchNo() {
        return generate("RCN");
    }

    public String generateLedgerNo() {
        return generate("LDG");
    }

    private String generate(String prefix) {
        String date = LocalDate.now().format(DATE_FMT);
        long seq = sequence.incrementAndGet();
        int random = ThreadLocalRandom.current().nextInt(1000);
        // 13 digits: 10-digit seq (unique per JVM) + 3-digit random (avoid cross-restart collision)
        long uniqueId = (seq % 10000000000L) * 1000 + random;
        return String.format("%s-%s-%013d", prefix, date, uniqueId);
    }
}
