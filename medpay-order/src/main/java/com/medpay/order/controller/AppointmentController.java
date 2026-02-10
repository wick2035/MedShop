package com.medpay.order.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.order.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "预约管理")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PutMapping("/{id}/check-in")
    @Operation(summary = "预约签到")
    public ApiResponse<Void> checkIn(@PathVariable UUID id) {
        appointmentService.checkIn(id);
        return ApiResponse.success();
    }
}
