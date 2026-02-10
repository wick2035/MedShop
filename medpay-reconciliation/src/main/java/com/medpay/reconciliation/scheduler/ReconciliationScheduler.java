package com.medpay.reconciliation.scheduler;

import com.medpay.reconciliation.service.ReconciliationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReconciliationScheduler {

    private final ReconciliationService reconciliationService;

    @Scheduled(cron = "0 30 1 * * ?")
    public void dailyReconciliation() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Starting daily reconciliation for: {}", yesterday);
        try {
            reconciliationService.triggerReconciliation(yesterday, "MOCK", null);
            log.info("Daily reconciliation completed for: {}", yesterday);
        } catch (Exception e) {
            log.error("Daily reconciliation failed for: {}", yesterday, e);
        }
    }
}
