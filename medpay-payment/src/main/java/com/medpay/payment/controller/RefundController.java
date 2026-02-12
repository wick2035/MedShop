package com.medpay.payment.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.payment.dto.RefundApprovalRequest;
import com.medpay.payment.dto.RefundCreateRequest;
import com.medpay.payment.dto.RefundResponse;
import com.medpay.payment.idempotency.Idempotent;
import com.medpay.payment.service.RefundService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    @Idempotent
    public ApiResponse<RefundResponse> createRefund(
            @Valid @RequestBody RefundCreateRequest request,
            HttpServletRequest httpRequest) {
        String idempotencyKey = httpRequest.getHeader("Idempotency-Key");
        UUID requestedBy = getCurrentUserId();
        RefundResponse response = refundService.requestRefund(request, requestedBy, idempotencyKey);
        return ApiResponse.success(response);
    }

    @GetMapping
    public ApiResponse<Page<RefundResponse>> getRefunds(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        UUID resolvedHospitalId = TenantUtil.resolveHospitalId(hospitalId);
        if (resolvedHospitalId == null) {
            return ApiResponse.success(Page.empty(pageable));
        }
        Page<RefundResponse> page = refundService.getRefundsByHospital(resolvedHospitalId, status, pageable);
        return ApiResponse.success(page);
    }

    @GetMapping("/{refundId}")
    public ApiResponse<RefundResponse> getRefundById(@PathVariable UUID refundId) {
        return ApiResponse.success(refundService.getRefundById(refundId));
    }

    @PutMapping("/{refundId}/approve")
    public ApiResponse<RefundResponse> approveRefund(
            @PathVariable UUID refundId,
            @RequestBody(required = false) RefundApprovalRequest request) {
        UUID reviewedBy = getCurrentUserId();
        RefundResponse response = refundService.approveRefund(refundId, request, reviewedBy);
        return ApiResponse.success(response);
    }

    @PutMapping("/{refundId}/reject")
    public ApiResponse<RefundResponse> rejectRefund(
            @PathVariable UUID refundId,
            @RequestBody(required = false) RefundApprovalRequest request) {
        UUID reviewedBy = getCurrentUserId();
        RefundResponse response = refundService.rejectRefund(refundId, request, reviewedBy);
        return ApiResponse.success(response);
    }

    private UUID getCurrentUserId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
