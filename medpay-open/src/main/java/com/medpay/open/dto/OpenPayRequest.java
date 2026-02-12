package com.medpay.open.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenPayRequest {

    @NotBlank(message = "支付渠道不能为空")
    private String paymentChannel;

    private String idempotencyKey;
}
