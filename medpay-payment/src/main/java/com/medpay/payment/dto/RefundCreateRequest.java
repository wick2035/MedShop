package com.medpay.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RefundCreateRequest {
    @NotNull(message = "订单ID不能为空")
    private UUID orderId;

    @NotBlank(message = "退款类型不能为空")
    private String refundType;

    @NotNull(message = "退款金额不能为空")
    @DecimalMin(value = "0.01", message = "退款金额必须大于0")
    private BigDecimal refundAmount;

    @NotBlank(message = "退款原因不能为空")
    private String refundReason;
}
