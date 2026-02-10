package com.medpay.hospital.repository;

import com.medpay.hospital.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 科室数据访问层
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    /**
     * 查询指定医院的所有科室，按 sortOrder 升序排列
     */
    List<Department> findByHospitalIdOrderBySortOrder(UUID hospitalId);

    /**
     * 查询指定医院的顶级科室（parentId 为 null）
     */
    List<Department> findByHospitalIdAndParentIdIsNull(UUID hospitalId);

    /**
     * 根据医院 ID 和科室编码查找
     */
    Optional<Department> findByHospitalIdAndCode(UUID hospitalId, String code);

    /**
     * 判断同一医院下是否已存在指定编码的科室
     */
    boolean existsByHospitalIdAndCode(UUID hospitalId, String code);
}
