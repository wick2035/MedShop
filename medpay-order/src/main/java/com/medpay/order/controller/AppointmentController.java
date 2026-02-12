package com.medpay.order.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.order.dto.AppointmentResponse;
import com.medpay.order.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "预约管理")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @Operation(summary = "查询医生某日预约列表")
    public ApiResponse<List<AppointmentResponse>> list(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentResponse> list = appointmentService.listByDoctor(doctorId, date)
                .stream()
                .map(AppointmentResponse::from)
                .toList();
        return ApiResponse.success(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询预约详情")
    public ApiResponse<AppointmentResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(AppointmentResponse.from(appointmentService.getById(id)));
    }

    @PutMapping("/{id}/check-in")
    @Operation(summary = "预约签到")
    public ApiResponse<Void> checkIn(@PathVariable UUID id) {
        appointmentService.checkIn(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/start")
    @Operation(summary = "开始就诊")
    public ApiResponse<Void> startConsultation(@PathVariable UUID id) {
        appointmentService.startConsultation(id);
        return ApiResponse.success();
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "完成就诊")
    public ApiResponse<Void> complete(@PathVariable UUID id) {
        appointmentService.complete(id);
        return ApiResponse.success();
    }
}
