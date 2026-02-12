package com.medpay.catalog.controller;

import com.medpay.catalog.domain.ServiceType;
import com.medpay.catalog.dto.MedicalServiceRequest;
import com.medpay.catalog.dto.MedicalServiceResponse;
import com.medpay.catalog.service.MedicalServiceService;
import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/services")
@Tag(name = "医疗服务")
@RequiredArgsConstructor
public class MedicalServiceController {

    private final MedicalServiceService medicalServiceService;

    @GetMapping
    @Operation(summary = "搜索医疗服务")
    public ApiResponse<Page<MedicalServiceResponse>> search(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ServiceType type,
            @RequestParam(required = false) UUID deptId,
            Pageable pageable) {
        Page<MedicalServiceResponse> page = medicalServiceService.search(TenantUtil.resolveHospitalId(hospitalId), keyword, type, deptId, pageable);
        return ApiResponse.success(page);
    }

    @PostMapping
    @Operation(summary = "创建医疗服务")
    public ApiResponse<MedicalServiceResponse> create(@Valid @RequestBody MedicalServiceRequest request) {
        MedicalServiceResponse response = medicalServiceService.create(request);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取医疗服务详情")
    public ApiResponse<MedicalServiceResponse> getById(@PathVariable UUID id) {
        MedicalServiceResponse response = medicalServiceService.getById(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新医疗服务")
    public ApiResponse<MedicalServiceResponse> update(@PathVariable UUID id,
                                                       @Valid @RequestBody MedicalServiceRequest request) {
        MedicalServiceResponse response = medicalServiceService.update(id, request);
        return ApiResponse.success(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除医疗服务（软删除）")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        medicalServiceService.delete(id);
        return ApiResponse.success();
    }
}
