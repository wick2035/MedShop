package com.medpay.insurance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class InsuranceCalculateRequest {
    @NotNull(message = "订单ID不能为空")
    private UUID orderId;
}
