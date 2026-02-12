package com.medpay.payment.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.payment.dto.PaymentInitiateRequest;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.dto.PaymentStatusResponse;
import com.medpay.payment.idempotency.Idempotent;
import com.medpay.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    @GetMapping
    public ApiResponse<Page<PaymentStatusResponse>> listPayments(
            @RequestParam(required = false) String hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        java.util.UUID hid = TenantUtil.resolveHospitalId(
                hospitalId != null ? java.util.UUID.fromString(hospitalId) : null);
        Page<PaymentStatusResponse> result = paymentService.listPayments(
                hid, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.success(result);
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
