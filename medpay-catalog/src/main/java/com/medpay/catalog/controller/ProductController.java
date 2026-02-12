package com.medpay.catalog.controller;

import com.medpay.catalog.domain.ProductType;
import com.medpay.catalog.dto.ProductRequest;
import com.medpay.catalog.dto.ProductResponse;
import com.medpay.catalog.service.ProductService;
import com.medpay.common.domain.ApiResponse;
import com.medpay.common.security.TenantUtil;
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

@RestController
@RequestMapping("/api/v1/catalog/products")
@Tag(name = "产品管理")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "搜索产品")
    public ApiResponse<Page<ProductResponse>> search(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProductType type,
            Pageable pageable) {
        Page<ProductResponse> page = productService.search(TenantUtil.resolveHospitalId(hospitalId), keyword, type, pageable);
        return ApiResponse.success(page);
    }

    @PostMapping
    @Operation(summary = "创建产品")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取产品详情")
    public ApiResponse<ProductResponse> getById(@PathVariable UUID id) {
        ProductResponse response = productService.getById(id);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新产品")
    public ApiResponse<ProductResponse> update(@PathVariable UUID id,
                                                @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}/stock")
    @Operation(summary = "更新库存")
    public ApiResponse<ProductResponse> updateStock(@PathVariable UUID id,
                                                     @RequestParam int quantity) {
        ProductResponse response = productService.updateStock(id, quantity);
        return ApiResponse.success(response);
    }
}
