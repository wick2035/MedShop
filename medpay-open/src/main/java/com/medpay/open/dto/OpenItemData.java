package com.medpay.open.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenItemData {

    @NotBlank(message = "外部商品ID不能为空")
    private String externalProductId;

    @NotBlank(message = "商品名称不能为空")
    private String name;

    private String code;

    private String productType;

    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private BigDecimal price;

    private String specification;

    private String unit;

    @Min(value = 1, message = "数量不能小于1")
    private int quantity;

    private boolean insuranceCovered;

    private String insuranceCategory;

    private BigDecimal insuranceRatio;
}
