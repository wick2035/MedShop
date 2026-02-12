package com.medpay.hospital.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.hospital.domain.HospitalStatus;
import com.medpay.hospital.dto.HospitalCreateRequest;
import com.medpay.hospital.dto.HospitalResponse;
import com.medpay.hospital.dto.HospitalUpdateRequest;
import com.medpay.hospital.service.HospitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * 医院管理接口
 */
@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
@Tag(name = "医院管理")
public class HospitalController {

    private final HospitalService hospitalService;

    /**
     * 创建医院
     */
    @Operation(summary = "创建医院")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ApiResponse<HospitalResponse> createHospital(@Valid @RequestBody HospitalCreateRequest request) {
        HospitalResponse response = hospitalService.createHospital(request);
        return ApiResponse.success(response);
    }

    /**
     * 分页查询医院列表
     */
    @Operation(summary = "分页查询医院列表")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping
    public ApiResponse<Page<HospitalResponse>> list(Pageable pageable) {
        Page<HospitalResponse> page = hospitalService.list(pageable);
        return ApiResponse.success(page);
    }

    /**
     * 根据 ID 查询医院详情
     */
    @Operation(summary = "查询医院详情")
    @GetMapping("/{id}")
    public ApiResponse<HospitalResponse> getById(@PathVariable UUID id) {
        HospitalResponse response = hospitalService.getById(id);
        return ApiResponse.success(response);
    }

    /**
     * 更新医院基本信息
     */
    @Operation(summary = "更新医院基本信息")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<HospitalResponse> update(@PathVariable UUID id,
                                                @Valid @RequestBody HospitalUpdateRequest request) {
        HospitalResponse response = hospitalService.updateHospital(id, request);
        return ApiResponse.success(response);
    }

    /**
     * 更新医院状态
     */
    @Operation(summary = "更新医院状态")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable UUID id,
                                          @RequestParam HospitalStatus status) {
        hospitalService.updateStatus(id, status);
        return ApiResponse.success();
    }

    /**
     * 更新医院扩展配置
     */
    @Operation(summary = "更新医院扩展配置")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}/config")
    public ApiResponse<Void> updateConfig(@PathVariable UUID id,
                                          @RequestBody Map<String, Object> config) {
        hospitalService.updateConfig(id, config);
        return ApiResponse.success();
    }
}
