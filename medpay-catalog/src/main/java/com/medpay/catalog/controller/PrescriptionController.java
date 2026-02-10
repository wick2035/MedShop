package com.medpay.catalog.controller;

import com.medpay.catalog.dto.PrescriptionCreateRequest;
import com.medpay.catalog.dto.PrescriptionResponse;
import com.medpay.catalog.service.PrescriptionService;
import com.medpay.common.domain.ApiResponse;
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

@Tag(name = "处方管理")
@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Operation(summary = "创建处方")
    @PostMapping
    public ApiResponse<PrescriptionResponse> create(
            @RequestHeader("X-Doctor-Id") UUID doctorId,
            @Valid @RequestBody PrescriptionCreateRequest request) {
        return ApiResponse.success(prescriptionService.createPrescription(doctorId, request));
    }

    @Operation(summary = "查看处方详情")
    @GetMapping("/{id}")
    public ApiResponse<PrescriptionResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(prescriptionService.getById(id));
    }

    @Operation(summary = "按患者查询处方列表")
    @GetMapping(params = "patientId")
    public ApiResponse<Page<PrescriptionResponse>> listByPatient(
            @RequestParam UUID patientId,
            Pageable pageable) {
        return ApiResponse.success(prescriptionService.listByPatient(patientId, pageable));
    }

    @Operation(summary = "按医生查询处方列表")
    @GetMapping(params = "doctorId")
    public ApiResponse<Page<PrescriptionResponse>> listByDoctor(
            @RequestParam UUID doctorId,
            Pageable pageable) {
        return ApiResponse.success(prescriptionService.listByDoctor(doctorId, pageable));
    }

    @Operation(summary = "确认处方")
    @PutMapping("/{id}/confirm")
    public ApiResponse<PrescriptionResponse> confirm(@PathVariable UUID id) {
        return ApiResponse.success(prescriptionService.confirmPrescription(id));
    }

    @Operation(summary = "取消处方")
    @PutMapping("/{id}/cancel")
    public ApiResponse<PrescriptionResponse> cancel(@PathVariable UUID id) {
        return ApiResponse.success(prescriptionService.cancelPrescription(id));
    }

    @Operation(summary = "处方转订单数据")
    @PostMapping("/{id}/order")
    public ApiResponse<PrescriptionResponse> convertToOrder(@PathVariable UUID id) {
        return ApiResponse.success(prescriptionService.getForOrderConversion(id));
    }
}
