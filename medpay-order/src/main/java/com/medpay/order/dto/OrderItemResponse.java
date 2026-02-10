package com.medpay.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        String itemType,
        UUID referenceId,
        String name,
        String specification,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        BigDecimal insuranceAmount,
        BigDecimal selfPayAmount
) {
}
