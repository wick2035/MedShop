package com.medpay.payment.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.payment.dto.PaymentInitiateRequest;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.dto.PaymentStatusResponse;
import com.medpay.payment.idempotency.Idempotent;
import com.medpay.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @Idempotent
    public ApiResponse<PaymentInitiateResponse> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            HttpServletRequest httpRequest) {
        String idempotencyKey = httpRequest.getHeader("Idempotency-Key");
        PaymentInitiateResponse response = paymentService.initiatePayment(request, idempotencyKey);
        return ApiResponse.success(response);
    }

    @GetMapping("/{transactionNo}")
    public ApiResponse<PaymentStatusResponse> getPaymentStatus(@PathVariable String transactionNo) {
        PaymentStatusResponse response = paymentService.queryPaymentStatus(transactionNo);
        return ApiResponse.success(response);
    }

    @PostMapping("/callback/{channel}")
    public ResponseEntity<String> handleCallback(
            @PathVariable String channel,
            @RequestBody String body,
            @RequestParam(required = false) String signature) {
        paymentService.handlePaymentCallback(channel, body, signature);
        return ResponseEntity.ok("OK");
    }
}
