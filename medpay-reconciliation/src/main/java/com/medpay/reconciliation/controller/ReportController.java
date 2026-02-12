package com.medpay.reconciliation.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.payment.domain.SettlementRecord;
import com.medpay.reconciliation.dto.DashboardKpiResponse;
import com.medpay.reconciliation.dto.SettlementGenerateRequest;
import com.medpay.reconciliation.service.ReportService;
import com.medpay.reconciliation.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final SettlementService settlementService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardKpiResponse> getDashboard(@RequestParam(required = false) UUID hospitalId) {
        UUID resolvedHospitalId = TenantUtil.resolveHospitalId(hospitalId);
        if (resolvedHospitalId == null) {
            return ApiResponse.success(DashboardKpiResponse.empty());
        }
        return ApiResponse.success(reportService.getDashboardKpi(resolvedHospitalId));
    }

    @PostMapping("/settlements/generate")
    public ApiResponse<SettlementRecord> generateSettlement(@Valid @RequestBody SettlementGenerateRequest request) {
        SettlementRecord settlement = settlementService.generateSettlement(
                request.getHospitalId(), request.getPeriodStart(), request.getPeriodEnd());
        return ApiResponse.success(settlement);
    }

    @GetMapping("/settlements")
    public ApiResponse<Page<SettlementRecord>> getSettlements(
            @RequestParam(required = false) UUID hospitalId, Pageable pageable) {
        UUID resolvedHospitalId = TenantUtil.resolveHospitalId(hospitalId);
        if (resolvedHospitalId == null) {
            return ApiResponse.success(Page.empty(pageable));
        }
        return ApiResponse.success(settlementService.getSettlements(resolvedHospitalId, pageable));
    }

    @PutMapping("/settlements/{settlementId}/confirm")
    public ApiResponse<SettlementRecord> confirmSettlement(@PathVariable UUID settlementId) {
        return ApiResponse.success(settlementService.confirmSettlement(settlementId));
    }

}
