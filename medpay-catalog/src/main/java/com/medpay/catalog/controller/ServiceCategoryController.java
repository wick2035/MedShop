package com.medpay.catalog.controller;

import com.medpay.catalog.dto.ServiceCategoryRequest;
import com.medpay.catalog.dto.ServiceCategoryResponse;
import com.medpay.catalog.service.ServiceCategoryService;
import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/categories")
@Tag(name = "服务分类")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    @GetMapping
    @Operation(summary = "获取分类树")
    public ApiResponse<List<ServiceCategoryResponse>> list(
            @RequestParam(required = false) UUID hospitalId) {
        UUID resolvedId = TenantUtil.resolveHospitalId(hospitalId);
        if (resolvedId == null) {
            return ApiResponse.success(List.of());
        }
        List<ServiceCategoryResponse> tree = serviceCategoryService.getTree(resolvedId);
        return ApiResponse.success(tree);
    }

    @PostMapping
    @Operation(summary = "创建分类")
    public ApiResponse<ServiceCategoryResponse> create(@Valid @RequestBody ServiceCategoryRequest request) {
        ServiceCategoryResponse response = serviceCategoryService.create(request);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新分类")
    public ApiResponse<ServiceCategoryResponse> update(@PathVariable UUID id,
                                                        @Valid @RequestBody ServiceCategoryRequest request) {
        ServiceCategoryResponse response = serviceCategoryService.update(id, request);
        return ApiResponse.success(response);
    }
}
