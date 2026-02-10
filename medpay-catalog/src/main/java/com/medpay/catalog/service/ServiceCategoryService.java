package com.medpay.catalog.service;

import com.medpay.catalog.domain.ServiceCategory;
import com.medpay.catalog.dto.ServiceCategoryRequest;
import com.medpay.catalog.dto.ServiceCategoryResponse;
import com.medpay.catalog.repository.ServiceCategoryRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceCategoryService {

    private final ServiceCategoryRepository serviceCategoryRepository;

    public ServiceCategoryResponse create(ServiceCategoryRequest request) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        if (serviceCategoryRepository.existsByHospitalIdAndCode(hospitalId, request.code())) {
            throw new BusinessException(ErrorCode.DUPLICATE_ENTRY, "分类编码已存在: " + request.code());
        }

        ServiceCategory category = new ServiceCategory();
        category.setHospitalId(hospitalId);
        category.setName(request.name());
        category.setCode(request.code());
        category.setParentId(request.parentId());
        category.setIconUrl(request.iconUrl());
        category.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);

        category = serviceCategoryRepository.save(category);
        return toResponse(category);
    }

    public ServiceCategoryResponse update(UUID id, ServiceCategoryRequest request) {
        ServiceCategory category = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "分类不存在"));

        category.setName(request.name());
        category.setCode(request.code());
        category.setParentId(request.parentId());
        category.setIconUrl(request.iconUrl());
        category.setSortOrder(request.sortOrder() != null ? request.sortOrder() : category.getSortOrder());

        category = serviceCategoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryResponse> getTree(UUID hospitalId) {
        List<ServiceCategory> allCategories = serviceCategoryRepository
                .findByHospitalIdOrderBySortOrder(hospitalId);
        return buildTree(allCategories);
    }

    private ServiceCategoryResponse toResponse(ServiceCategory category) {
        return new ServiceCategoryResponse(
                category.getId(),
                category.getName(),
                category.getCode(),
                category.getParentId(),
                category.getIconUrl(),
                category.getSortOrder(),
                category.getStatus(),
                null
        );
    }

    private List<ServiceCategoryResponse> buildTree(List<ServiceCategory> allCategories) {
        Map<UUID, List<ServiceCategory>> childrenMap = allCategories.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(ServiceCategory::getParentId));

        List<ServiceCategory> roots = allCategories.stream()
                .filter(c -> c.getParentId() == null)
                .toList();

        return roots.stream()
                .map(root -> buildNode(root, childrenMap))
                .toList();
    }

    private ServiceCategoryResponse buildNode(ServiceCategory category,
                                               Map<UUID, List<ServiceCategory>> childrenMap) {
        List<ServiceCategory> children = childrenMap.getOrDefault(category.getId(), new ArrayList<>());
        List<ServiceCategoryResponse> childResponses = children.stream()
                .map(child -> buildNode(child, childrenMap))
                .toList();

        return new ServiceCategoryResponse(
                category.getId(),
                category.getName(),
                category.getCode(),
                category.getParentId(),
                category.getIconUrl(),
                category.getSortOrder(),
                category.getStatus(),
                childResponses.isEmpty() ? null : childResponses
        );
    }
}
