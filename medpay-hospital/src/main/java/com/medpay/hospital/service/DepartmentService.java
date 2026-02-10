package com.medpay.hospital.service;

import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.hospital.domain.Department;
import com.medpay.hospital.dto.DepartmentRequest;
import com.medpay.hospital.dto.DepartmentResponse;
import com.medpay.hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 科室业务逻辑层
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    /**
     * 创建科室
     */
    public DepartmentResponse create(UUID hospitalId, DepartmentRequest request) {
        if (departmentRepository.existsByHospitalIdAndCode(hospitalId, request.code())) {
            throw new BusinessException(ErrorCode.DUPLICATE_ENTRY, "该医院下科室编码已存在: " + request.code());
        }

        Department department = new Department();
        department.setHospitalId(hospitalId);
        department.setName(request.name());
        department.setCode(request.code());
        department.setParentId(request.parentId());
        department.setDescription(request.description());
        department.setSortOrder(request.sortOrder());
        department.setStatus("ACTIVE");

        department = departmentRepository.save(department);
        return toResponse(department);
    }

    /**
     * 更新科室
     */
    public DepartmentResponse update(UUID hospitalId, UUID departmentId, DepartmentRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .filter(d -> d.getHospitalId().equals(hospitalId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        department.setName(request.name());
        department.setCode(request.code());
        department.setParentId(request.parentId());
        department.setDescription(request.description());
        department.setSortOrder(request.sortOrder());

        department = departmentRepository.save(department);
        return toResponse(department);
    }

    /**
     * 删除科室（软删除，将状态设为 INACTIVE）
     */
    public void delete(UUID hospitalId, UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .filter(d -> d.getHospitalId().equals(hospitalId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        department.setStatus("INACTIVE");
        departmentRepository.save(department);
    }

    /**
     * 获取指定医院的科室树形结构
     */
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getTree(UUID hospitalId) {
        List<Department> allDepartments = departmentRepository.findByHospitalIdOrderBySortOrder(hospitalId);
        return buildTree(allDepartments);
    }

    /**
     * 根据 ID 查询科室详情
     */
    @Transactional(readOnly = true)
    public DepartmentResponse getById(UUID hospitalId, UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .filter(d -> d.getHospitalId().equals(hospitalId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        return toResponse(department);
    }

    /**
     * 实体转响应 DTO（不含子级）
     */
    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getCode(),
                department.getParentId(),
                department.getDescription(),
                department.getSortOrder(),
                department.getStatus(),
                Collections.emptyList()
        );
    }

    /**
     * 将扁平科室列表构建为树形结构
     *
     * @param departments 同一医院下的所有科室（已按 sortOrder 排序）
     * @return 顶级科室列表，每个节点递归包含 children
     */
    private List<DepartmentResponse> buildTree(List<Department> departments) {
        // 按 parentId 分组
        Map<UUID, List<Department>> childrenMap = departments.stream()
                .filter(d -> d.getParentId() != null)
                .collect(Collectors.groupingBy(Department::getParentId));

        // 递归构建子树
        return departments.stream()
                .filter(d -> d.getParentId() == null)
                .map(d -> buildNode(d, childrenMap))
                .collect(Collectors.toList());
    }

    /**
     * 递归构建单个科室节点及其子节点
     */
    private DepartmentResponse buildNode(Department department, Map<UUID, List<Department>> childrenMap) {
        List<Department> children = childrenMap.getOrDefault(department.getId(), Collections.emptyList());

        List<DepartmentResponse> childResponses = children.stream()
                .map(child -> buildNode(child, childrenMap))
                .collect(Collectors.toList());

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getCode(),
                department.getParentId(),
                department.getDescription(),
                department.getSortOrder(),
                department.getStatus(),
                childResponses
        );
    }
}
