package com.medpay.order.dto;

import com.medpay.order.domain.ItemType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OrderItemRequest(
        @NotNull ItemType itemType,
        @NotNull UUID referenceId,
        @Min(1) int quantity
) {
}
