package com.medpay.order.controller;

import com.medpay.common.constant.OrderStatus;
import com.medpay.common.constant.OrderType;
import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantContext;
import com.medpay.order.dto.OrderResponse;
import com.medpay.order.repository.OrderRepository;
import com.medpay.order.service.OrderService;
import com.medpay.order.statemachine.OrderEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "订单管理-管理端")
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @GetMapping
    @Operation(summary = "管理端订单列表")
    public ApiResponse<Page<OrderResponse>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType type,
            Pageable pageable) {
        UUID hospitalId = TenantContext.getCurrentHospitalId();
        if (hospitalId == null) {
            return ApiResponse.success(Page.empty(pageable));
        }
        Page<OrderResponse> page = orderService.adminListOrders(hospitalId, status, type, pageable);
        return ApiResponse.success(page);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新订单状态")
    public ApiResponse<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam OrderEvent event) {
        orderService.updateOrderStatus(id, event);
        return ApiResponse.success();
    }

    @GetMapping("/statistics")
    @Operation(summary = "订单状态统计")
    public ApiResponse<Map<String, Long>> statistics() {
        UUID hospitalId = TenantContext.getCurrentHospitalId();
        if (hospitalId == null) {
            Map<String, Long> empty = new LinkedHashMap<>();
            for (OrderStatus s : OrderStatus.values()) {
                empty.put(s.name(), 0L);
            }
            return ApiResponse.success(empty);
        }
        Map<String, Long> stats = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            long count = orderRepository.countByHospitalIdAndStatus(hospitalId, s.name());
            stats.put(s.name(), count);
        }
        return ApiResponse.success(stats);
    }
}
