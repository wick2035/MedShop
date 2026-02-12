package com.medpay.open.controller;

import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.ApiClientContext;
import com.medpay.insurance.dto.InsuranceCoverageResult;
import com.medpay.open.dto.*;
import com.medpay.open.service.OpenOrderService;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.dto.PaymentStatusResponse;
import com.medpay.payment.dto.RefundResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/open")
@RequiredArgsConstructor
public class OpenApiController {

    private final OpenOrderService openOrderService;

    @PostMapping("/orders")
    public ResponseEntity<OpenOrderResponse> createOrder(@Valid @RequestBody OpenOrderRequest request) {
        requirePermission("ORDER");
        OpenOrderResponse response = openOrderService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{externalOrderId}")
    public ResponseEntity<OpenOrderResponse> getOrder(@PathVariable String externalOrderId) {
        requirePermission("ORDER");
        OpenOrderResponse response = openOrderService.getOrder(externalOrderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{externalOrderId}/pay")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @PathVariable String externalOrderId,
            @Valid @RequestBody OpenPayRequest request) {
        requirePermission("PAYMENT");
        PaymentInitiateResponse response = openOrderService.initiatePayment(externalOrderId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/orders/{externalOrderId}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(
            @PathVariable String externalOrderId,
            @RequestBody(required = false) Map<String, String> body) {
        requirePermission("ORDER");
        String reason = body != null ? body.get("reason") : null;
        openOrderService.cancelOrder(externalOrderId, reason);
        return ResponseEntity.ok(Map.of("message", "订单已取消", "externalOrderId", externalOrderId));
    }

    @PostMapping("/orders/{externalOrderId}/refund")
    public ResponseEntity<RefundResponse> requestRefund(
            @PathVariable String externalOrderId,
            @Valid @RequestBody OpenRefundRequest request) {
        requirePermission("PAYMENT");
        RefundResponse response = openOrderService.requestRefund(externalOrderId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{externalOrderId}/payment-status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable String externalOrderId) {
        requirePermission("PAYMENT");
        PaymentStatusResponse response = openOrderService.getPaymentStatus(externalOrderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/insurance/calculate")
    public ResponseEntity<InsuranceCoverageResult> calculateInsurance(
            @RequestBody Map<String, String> body) {
        requirePermission("INSURANCE");
        String externalOrderId = body.get("externalOrderId");
        if (externalOrderId == null || externalOrderId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_MISSING, "externalOrderId不能为空");
        }
        InsuranceCoverageResult result = openOrderService.calculateInsurance(externalOrderId);
        return ResponseEntity.ok(result);
    }

    private void requirePermission(String permission) {
        ApiClientContext.ApiClientInfo info = ApiClientContext.get();
        if (info == null || !info.permissions().contains(permission)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "API客户端无" + permission + "权限");
        }
    }
}
