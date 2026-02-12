package com.medpay.reconciliation.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.reconciliation.domain.ReconciliationDetail;
import com.medpay.reconciliation.dto.ReconciliationBatchResponse;
import com.medpay.reconciliation.dto.ReconciliationResolveRequest;
import com.medpay.reconciliation.dto.ReconciliationTriggerRequest;
import com.medpay.reconciliation.repository.ReconciliationDetailRepository;
import com.medpay.reconciliation.service.ReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;
    private final ReconciliationDetailRepository detailRepository;

    @PostMapping("/trigger")
    public ApiResponse<ReconciliationBatchResponse> trigger(@RequestBody ReconciliationTriggerRequest request) {
        ReconciliationBatchResponse response = reconciliationService.triggerReconciliation(
                request.getReconciliationDate(), request.getChannel(), TenantUtil.resolveHospitalId(request.getHospitalId()));
        return ApiResponse.success(response);
    }

    @GetMapping("/batches")
    public ApiResponse<Page<ReconciliationBatchResponse>> getBatches(Pageable pageable) {
        return ApiResponse.success(reconciliationService.getBatches(pageable));
    }

    @GetMapping("/batches/{batchId}/details")
    public ApiResponse<Page<ReconciliationDetail>> getDetails(
            @PathVariable UUID batchId, Pageable pageable) {
        return ApiResponse.success(detailRepository.findByBatchId(batchId, pageable));
    }

    @PutMapping("/details/{detailId}/resolve")
    public ApiResponse<Void> resolveDetail(
            @PathVariable UUID detailId,
            @RequestBody ReconciliationResolveRequest request) {
        UUID resolvedBy = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        reconciliationService.resolveDetail(detailId, request, resolvedBy);
        return ApiResponse.success();
    }
}
