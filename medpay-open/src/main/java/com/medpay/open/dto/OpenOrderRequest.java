package com.medpay.open.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenOrderRequest {

    @NotBlank(message = "外部订单ID不能为空")
    private String externalOrderId;

    @NotBlank(message = "外部患者ID不能为空")
    private String externalPatientId;

    @NotBlank(message = "患者姓名不能为空")
    private String patientName;

    private String patientGender;

    private String patientInsuranceType;

    private String orderType;

    @NotEmpty(message = "订单明细不能为空")
    @Valid
    private List<OpenItemData> items;

    private String remark;
}
