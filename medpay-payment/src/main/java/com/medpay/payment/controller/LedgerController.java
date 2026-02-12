package com.medpay.payment.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.payment.dto.LedgerResponse;
import com.medpay.payment.service.PaymentLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final PaymentLedgerService ledgerService;

    @GetMapping
    public ApiResponse<Page<LedgerResponse>> getLedger(
            @RequestParam(required = false) UUID hospitalId,
            Pageable pageable) {
        UUID resolvedHospitalId = TenantUtil.resolveHospitalId(hospitalId);
        if (resolvedHospitalId == null) {
            return ApiResponse.success(Page.empty(pageable));
        }
        Page<LedgerResponse> page = ledgerService.getLedger(resolvedHospitalId, pageable);
        return ApiResponse.success(page);
    }
}
