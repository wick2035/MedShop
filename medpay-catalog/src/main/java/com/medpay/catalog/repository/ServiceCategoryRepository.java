package com.medpay.catalog.repository;

import com.medpay.catalog.domain.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {

    List<ServiceCategory> findByHospitalIdOrderBySortOrder(UUID hospitalId);

    List<ServiceCategory> findByHospitalIdAndParentIdIsNull(UUID hospitalId);

    boolean existsByHospitalIdAndCode(UUID hospitalId, String code);
}
