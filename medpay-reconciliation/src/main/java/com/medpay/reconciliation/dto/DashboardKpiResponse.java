package com.medpay.reconciliation.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardKpiResponse {
    private BigDecimal todayRevenue;
    private long todayOrders;
    private BigDecimal todayRefunds;
    private long pendingRefunds;
    private BigDecimal monthRevenue;
    private long monthOrders;
    private BigDecimal monthRefunds;
    private BigDecimal settlementPending;

    public static DashboardKpiResponse empty() {
        return DashboardKpiResponse.builder()
                .todayRevenue(BigDecimal.ZERO)
                .todayOrders(0)
                .todayRefunds(BigDecimal.ZERO)
                .pendingRefunds(0)
                .monthRevenue(BigDecimal.ZERO)
                .monthOrders(0)
                .monthRefunds(BigDecimal.ZERO)
                .settlementPending(BigDecimal.ZERO)
                .build();
    }
}
