package com.medpay.reconciliation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class SettlementGenerateRequest {
    @NotNull
    private UUID hospitalId;
    @NotNull
    private LocalDate periodStart;
    @NotNull
    private LocalDate periodEnd;
}
