package com.medpay.payment.controller;

import com.medpay.common.domain.ApiResponse;
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
        // TODO: get actual user ID from security context
        UUID requestedBy = UUID.randomUUID();
        RefundResponse response = refundService.requestRefund(request, requestedBy, idempotencyKey);
        return ApiResponse.success(response);
    }

    @GetMapping
    public ApiResponse<Page<RefundResponse>> getRefunds(
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<RefundResponse> page = refundService.getRefundsByHospital(hospitalId, status, pageable);
        return ApiResponse.success(page);
    }

    @PutMapping("/{refundId}/approve")
    public ApiResponse<RefundResponse> approveRefund(
            @PathVariable UUID refundId,
            @RequestBody(required = false) RefundApprovalRequest request) {
        // TODO: get actual reviewer ID from security context
        UUID reviewedBy = UUID.randomUUID();
        RefundResponse response = refundService.approveRefund(refundId, request, reviewedBy);
        return ApiResponse.success(response);
    }

    @PutMapping("/{refundId}/reject")
    public ApiResponse<RefundResponse> rejectRefund(
            @PathVariable UUID refundId,
            @RequestBody(required = false) RefundApprovalRequest request) {
        UUID reviewedBy = UUID.randomUUID();
        RefundResponse response = refundService.rejectRefund(refundId, request, reviewedBy);
        return ApiResponse.success(response);
    }
}
