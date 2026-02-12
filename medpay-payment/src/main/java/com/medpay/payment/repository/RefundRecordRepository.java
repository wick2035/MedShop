package com.medpay.payment.repository;

import com.medpay.payment.domain.RefundRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRecordRepository extends JpaRepository<RefundRecord, UUID> {

    Optional<RefundRecord> findByRefundNo(String refundNo);

    List<RefundRecord> findByOrderId(UUID orderId);

    Page<RefundRecord> findByHospitalId(UUID hospitalId, Pageable pageable);

    Page<RefundRecord> findByHospitalIdAndStatus(UUID hospitalId, String status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.refundAmount), 0) FROM RefundRecord r " +
            "WHERE r.orderId = :orderId AND r.status IN ('APPROVED', 'SUCCESS')")
    BigDecimal sumApprovedRefundsByOrderId(@Param("orderId") UUID orderId);

    @Query("SELECT COALESCE(SUM(r.refundAmount), 0) FROM RefundRecord r " +
            "WHERE r.hospitalId = :hospitalId AND r.status = 'SUCCESS' " +
            "AND r.refundedAt BETWEEN :start AND :end")
    BigDecimal sumRefundsByHospitalAndRefundedAtBetween(
            @Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
