package com.medpay.hospital.repository;

import com.medpay.hospital.domain.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 医院数据访问层
 */
@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    /**
     * 根据医院编码查找
     */
    Optional<Hospital> findByCode(String code);

    /**
     * 按状态分页查询
     */
    Page<Hospital> findByStatus(String status, Pageable pageable);

    /**
     * 查询所有处于 ACTIVE 状态的医院
     */
    @Query("SELECT h FROM Hospital h WHERE h.status = 'ACTIVE'")
    List<Hospital> findAllActive();

    /**
     * 判断指定编码是否已存在
     */
    boolean existsByCode(String code);
}
