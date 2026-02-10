package com.medpay.insurance.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.insurance.dto.SplitPayRequest;
import com.medpay.insurance.dto.SplitPayResponse;
import com.medpay.insurance.service.SplitPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class SplitPaymentController {

    private final SplitPaymentService splitPaymentService;

    @PostMapping("/split-pay")
    public ApiResponse<SplitPayResponse> splitPay(@Valid @RequestBody SplitPayRequest request) {
        SplitPayResponse response = splitPaymentService.splitPay(request);
        return ApiResponse.success(response);
    }

    @GetMapping("/{orderId}/splits")
    public ApiResponse<List<SplitPayResponse.SplitDetail>> getSplits(@PathVariable UUID orderId) {
        return ApiResponse.success(splitPaymentService.getSplits(orderId));
    }
}
