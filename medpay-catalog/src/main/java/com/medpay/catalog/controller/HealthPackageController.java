package com.medpay.catalog.controller;

import com.medpay.catalog.dto.HealthPackageRequest;
import com.medpay.catalog.dto.HealthPackageResponse;
import com.medpay.catalog.service.HealthPackageService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "健康套餐")
@RestController
@RequestMapping("/api/v1/catalog/packages")
@RequiredArgsConstructor
public class HealthPackageController {

    private final HealthPackageService healthPackageService;

    @Operation(summary = "查询健康套餐列表")
    @GetMapping
    public ApiResponse<Page<HealthPackageResponse>> list(
            @RequestParam(required = false) UUID hospitalId,
            Pageable pageable) {
        return ApiResponse.success(healthPackageService.list(hospitalId, pageable));
    }

    @Operation(summary = "创建健康套餐")
    @PostMapping
    public ApiResponse<HealthPackageResponse> create(@Valid @RequestBody HealthPackageRequest request) {
        return ApiResponse.success(healthPackageService.create(request));
    }

    @Operation(summary = "查看健康套餐详情")
    @GetMapping("/{id}")
    public ApiResponse<HealthPackageResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(healthPackageService.getById(id));
    }

    @Operation(summary = "更新健康套餐")
    @PutMapping("/{id}")
    public ApiResponse<HealthPackageResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody HealthPackageRequest request) {
        return ApiResponse.success(healthPackageService.update(id, request));
    }
}
