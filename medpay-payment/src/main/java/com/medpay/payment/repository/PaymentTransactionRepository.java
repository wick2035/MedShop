package com.medpay.payment.repository;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.payment.domain.PaymentTransaction;
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
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByTransactionNo(String transactionNo);

    List<PaymentTransaction> findByOrderId(UUID orderId);

    Optional<PaymentTransaction> findByChannelTransactionId(String channelTransactionId);

    Page<PaymentTransaction> findByHospitalIdAndStatusAndCreatedAtBetween(
            UUID hospitalId, PaymentStatus status, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<PaymentTransaction> findByHospitalId(UUID hospitalId, Pageable pageable);

    List<PaymentTransaction> findByStatusAndCreatedAtBetween(
            PaymentStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM PaymentTransaction p " +
            "WHERE p.hospitalId = :hospitalId AND p.status = :status " +
            "AND p.paidAt BETWEEN :start AND :end")
    BigDecimal sumAmountByHospitalAndStatusAndPaidAtBetween(
            @Param("hospitalId") UUID hospitalId,
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    long countByHospitalIdAndStatus(UUID hospitalId, PaymentStatus status);

    @Query("SELECT COUNT(p) FROM PaymentTransaction p " +
            "WHERE p.hospitalId = :hospitalId AND p.status = :status " +
            "AND p.paidAt BETWEEN :start AND :end")
    long countByHospitalIdAndStatusAndPaidAtBetween(
            @Param("hospitalId") UUID hospitalId,
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
