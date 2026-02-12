package com.medpay.hospital.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
import com.medpay.hospital.dto.DepartmentRequest;
import com.medpay.hospital.dto.DepartmentResponse;
import com.medpay.hospital.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * 科室管理接口
 */
@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}/departments")
@RequiredArgsConstructor
@Tag(name = "科室管理")
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * 获取科室树形结构
     */
    @Operation(summary = "获取科室树形结构")
    @GetMapping
    public ApiResponse<List<DepartmentResponse>> getTree(@PathVariable UUID hospitalId) {
        TenantUtil.verifyAccess(hospitalId);
        List<DepartmentResponse> tree = departmentService.getTree(hospitalId);
        return ApiResponse.success(tree);
    }

    /**
     * 创建科室
     */
    @Operation(summary = "创建科室")
    @PostMapping
    public ApiResponse<DepartmentResponse> create(@PathVariable UUID hospitalId,
                                                  @Valid @RequestBody DepartmentRequest request) {
        TenantUtil.verifyAccess(hospitalId);
        DepartmentResponse response = departmentService.create(hospitalId, request);
        return ApiResponse.success(response);
    }

    /**
     * 更新科室
     */
    @Operation(summary = "更新科室")
    @PutMapping("/{id}")
    public ApiResponse<DepartmentResponse> update(@PathVariable UUID hospitalId,
                                                  @PathVariable UUID id,
                                                  @Valid @RequestBody DepartmentRequest request) {
        TenantUtil.verifyAccess(hospitalId);
        DepartmentResponse response = departmentService.update(hospitalId, id, request);
        return ApiResponse.success(response);
    }

    /**
     * 删除科室（软删除）
     */
    @Operation(summary = "删除科室")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID hospitalId,
                                    @PathVariable UUID id) {
        TenantUtil.verifyAccess(hospitalId);
        departmentService.delete(hospitalId, id);
        return ApiResponse.success();
    }
}
