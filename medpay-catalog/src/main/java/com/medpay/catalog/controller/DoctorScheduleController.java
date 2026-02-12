package com.medpay.catalog.controller;

import com.medpay.catalog.dto.DoctorScheduleRequest;
import com.medpay.catalog.dto.DoctorScheduleResponse;
import com.medpay.catalog.service.DoctorScheduleService;
import com.medpay.common.domain.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "排班管理")
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    @Operation(summary = "查询排班详情")
    @GetMapping("/{id}")
    public ApiResponse<DoctorScheduleResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(doctorScheduleService.getScheduleById(id));
    }

    @Operation(summary = "查询可用排班")
    @GetMapping
    public ApiResponse<Page<DoctorScheduleResponse>> findAvailable(
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        return ApiResponse.success(doctorScheduleService.findAvailable(doctorId, date, pageable));
    }

    @Operation(summary = "创建排班")
    @PostMapping
    public ApiResponse<DoctorScheduleResponse> create(@Valid @RequestBody DoctorScheduleRequest request) {
        return ApiResponse.success(doctorScheduleService.createSchedule(request));
    }

    @Operation(summary = "更新排班")
    @PutMapping("/{id}")
    public ApiResponse<DoctorScheduleResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody DoctorScheduleRequest request) {
        return ApiResponse.success(doctorScheduleService.updateSchedule(id, request));
    }

    @Operation(summary = "取消排班")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancel(@PathVariable UUID id) {
        doctorScheduleService.cancelSchedule(id);
        return ApiResponse.success();
    }
}
