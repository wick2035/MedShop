package com.medpay.order.dto;

import com.medpay.common.constant.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrderCreateRequest(
        @NotNull OrderType orderType,
        @NotEmpty List<@Valid OrderItemRequest> items,
        AppointmentInfo appointmentInfo,
        DeliveryInfo deliveryInfo,
        String couponCode,
        String remark
) {
}
