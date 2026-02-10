package com.medpay.reconciliation.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ReconciliationTriggerRequest {
    private LocalDate reconciliationDate;
    private String channel;
    private UUID hospitalId;
}
