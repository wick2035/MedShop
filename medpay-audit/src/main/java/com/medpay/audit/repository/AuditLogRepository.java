package com.medpay.audit.repository;

import com.medpay.audit.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByHospitalId(UUID hospitalId, Pageable pageable);

    Page<AuditLog> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:hospitalId IS NULL OR a.hospitalId = :hospitalId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<AuditLog> search(UUID hospitalId, String action, String entityType,
                          LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
