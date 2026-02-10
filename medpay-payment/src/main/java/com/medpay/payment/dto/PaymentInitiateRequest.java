package com.medpay.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PaymentInitiateRequest {
    @NotNull(message = "订单ID不能为空")
    private UUID orderId;

    @NotNull(message = "支付渠道不能为空")
    private String paymentChannel;
}
