package com.medpay.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNo,
        UUID patientId,
        UUID doctorId,
        String orderType,
        String orderSource,
        BigDecimal totalAmount,
        BigDecimal discountAmount,
        BigDecimal insuranceAmount,
        BigDecimal selfPayAmount,
        String status,
        List<OrderItemResponse> items,
        LocalDateTime paidAt,
        LocalDateTime completedAt,
        String cancelReason,
        LocalDateTime expireAt,
        LocalDate appointmentDate,
        LocalTime appointmentTimeStart,
        LocalTime appointmentTimeEnd,
        String deliveryType,
        String deliveryAddress,
        String remark,
        LocalDateTime createdAt
) {
}
