package com.medpay.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SplitPayRequest {
    @NotNull(message = "订单ID不能为空")
    private UUID orderId;

    private boolean useInsurance = true;

    @NotBlank(message = "医保类型不能为空")
    private String insuranceType;

    @NotBlank(message = "医保卡号不能为空")
    private String insuranceNumber;

    private String insuranceRegion;
    private String paymentChannel = "MOCK";
}
