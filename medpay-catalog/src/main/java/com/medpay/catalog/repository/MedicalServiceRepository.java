package com.medpay.catalog.repository;

import com.medpay.catalog.domain.MedicalService;
import com.medpay.catalog.domain.ServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, UUID> {

    Page<MedicalService> findByHospitalIdAndServiceType(UUID hospitalId, ServiceType type, Pageable pageable);

    Page<MedicalService> findByDepartmentId(UUID departmentId, Pageable pageable);

    Page<MedicalService> findByCategoryId(UUID categoryId, Pageable pageable);

    @Query("SELECT ms FROM MedicalService ms WHERE ms.hospitalId = :hid " +
            "AND (:keyword IS NULL OR ms.name LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:type IS NULL OR ms.serviceType = :type) " +
            "AND (:deptId IS NULL OR ms.departmentId = :deptId) " +
            "AND ms.status = 'ACTIVE'")
    Page<MedicalService> search(@Param("hid") UUID hospitalId,
                                @Param("keyword") String keyword,
                                @Param("type") ServiceType type,
                                @Param("deptId") UUID departmentId,
                                Pageable pageable);
}
