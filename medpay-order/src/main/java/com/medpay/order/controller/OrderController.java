package com.medpay.order.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.order.dto.AppointmentOrderRequest;
import com.medpay.order.dto.OrderCreateRequest;
import com.medpay.order.dto.OrderResponse;
import com.medpay.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "订单管理")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "创建订单")
    public ApiResponse<OrderResponse> createOrder(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(value = "X-Patient-Id") UUID patientId,
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request, patientId);
        return ApiResponse.success(response);
    }

    @GetMapping
    @Operation(summary = "查询患者订单列表")
    public ApiResponse<Page<OrderResponse>> listOrders(
            @RequestHeader(value = "X-Patient-Id") UUID patientId,
            Pageable pageable) {
        Page<OrderResponse> page = orderService.listOrders(patientId, pageable);
        return ApiResponse.success(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询订单详情")
    public ApiResponse<OrderResponse> getOrderDetail(@PathVariable UUID id) {
        OrderResponse response = orderService.getOrderDetail(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消订单")
    public ApiResponse<Void> cancelOrder(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        orderService.cancelOrder(id, reason);
        return ApiResponse.success();
    }

    @PostMapping("/from-prescription/{prescriptionId}")
    @Operation(summary = "处方转订单")
    public ApiResponse<OrderResponse> createPrescriptionOrder(
            @RequestHeader(value = "X-Patient-Id") UUID patientId,
            @PathVariable UUID prescriptionId) {
        OrderResponse response = orderService.createPrescriptionOrder(prescriptionId, patientId);
        return ApiResponse.success(response);
    }

    @PostMapping("/appointment")
    @Operation(summary = "创建挂号预约订单")
    public ApiResponse<OrderResponse> createAppointmentOrder(
            @RequestHeader(value = "X-Patient-Id") UUID patientId,
            @Valid @RequestBody AppointmentOrderRequest request) {
        OrderResponse response = orderService.createAppointmentOrder(request, patientId);
        return ApiResponse.success(response);
    }
}
