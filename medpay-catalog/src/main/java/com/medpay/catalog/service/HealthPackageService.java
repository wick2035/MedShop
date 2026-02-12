package com.medpay.catalog.service;

import com.medpay.catalog.domain.HealthPackage;
import com.medpay.catalog.dto.HealthPackageRequest;
import com.medpay.catalog.dto.HealthPackageResponse;
import com.medpay.catalog.repository.HealthPackageRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import com.medpay.common.security.TenantUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class HealthPackageService {

    private final HealthPackageRepository healthPackageRepository;

    public HealthPackageResponse create(HealthPackageRequest request) {
        HealthPackage pkg = new HealthPackage();
        pkg.setHospitalId(TenantContext.requireCurrentHospitalId());
        pkg.setName(request.name());
        pkg.setCode(request.code());
        pkg.setDescription(request.description());
        pkg.setPackageType(request.packageType());
        pkg.setPrice(request.price());
        pkg.setOriginalPrice(request.originalPrice());
        pkg.setValidityDays(request.validityDays());
        pkg.setMaxUsage(request.maxUsage());
        pkg.setIncludedItems(request.includedItems());
        pkg.setImageUrl(request.imageUrl());
        pkg.setSortOrder(request.sortOrder());
        pkg.setStatus("ACTIVE");

        HealthPackage saved = healthPackageRepository.save(pkg);
        return toResponse(saved);
    }

    public HealthPackageResponse update(UUID id, HealthPackageRequest request) {
        HealthPackage pkg = findByIdOrThrow(id);
        TenantUtil.verifyAccess(pkg.getHospitalId());
        pkg.setName(request.name());
        pkg.setCode(request.code());
        pkg.setDescription(request.description());
        pkg.setPackageType(request.packageType());
        pkg.setPrice(request.price());
        pkg.setOriginalPrice(request.originalPrice());
        pkg.setValidityDays(request.validityDays());
        pkg.setMaxUsage(request.maxUsage());
        pkg.setIncludedItems(request.includedItems());
        pkg.setImageUrl(request.imageUrl());
        pkg.setSortOrder(request.sortOrder());

        HealthPackage saved = healthPackageRepository.save(pkg);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HealthPackageResponse> list(UUID hospitalIdParam, Pageable pageable) {
        UUID hospitalId = hospitalIdParam != null ? hospitalIdParam : TenantContext.getCurrentHospitalId();
        if (hospitalId == null) {
            return Page.empty(pageable);
        }
        return healthPackageRepository.findByHospitalIdAndStatus(hospitalId, "ACTIVE", pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public HealthPackageResponse getById(UUID id) {
        HealthPackage pkg = findByIdOrThrow(id);
        return toResponse(pkg);
    }

    private HealthPackage findByIdOrThrow(UUID id) {
        return healthPackageRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "健康套餐不存在"));
    }

    private HealthPackageResponse toResponse(HealthPackage pkg) {
        return new HealthPackageResponse(
                pkg.getId(),
                pkg.getHospitalId(),
                pkg.getName(),
                pkg.getCode(),
                pkg.getDescription(),
                pkg.getPackageType(),
                pkg.getPrice(),
                pkg.getOriginalPrice(),
                pkg.getValidityDays(),
                pkg.getMaxUsage(),
                pkg.getIncludedItems(),
                pkg.getImageUrl(),
                pkg.getSortOrder(),
                pkg.getStatus(),
                pkg.getCreatedAt()
        );
    }
}
