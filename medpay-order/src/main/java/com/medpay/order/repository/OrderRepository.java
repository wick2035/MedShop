package com.medpay.order.repository;

import com.medpay.order.domain.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNo(String orderNo);

    Page<Order> findByPatientId(UUID patientId, Pageable pageable);

    Page<Order> findByHospitalIdAndStatus(UUID hospitalId, String status, Pageable pageable);

    Page<Order> findByHospitalId(UUID hospitalId, Pageable pageable);

    Page<Order> findByHospitalIdAndStatusAndOrderType(UUID hospitalId, String status,
                                                       String orderType, Pageable pageable);

    Page<Order> findByHospitalIdAndOrderType(UUID hospitalId, String orderType, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findByIdForUpdate(@Param("orderId") UUID orderId);

    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING_PAYMENT' AND o.expireAt < :now")
    List<Order> findExpiredOrders(@Param("now") LocalDateTime now, Pageable pageable);

    long countByHospitalIdAndStatus(UUID hospitalId, String status);
}
