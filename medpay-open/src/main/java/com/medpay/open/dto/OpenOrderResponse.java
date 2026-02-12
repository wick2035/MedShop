package com.medpay.open.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenOrderResponse {

    private String externalOrderId;
    private UUID medpayOrderId;
    private String medpayOrderNo;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal insuranceAmount;
    private BigDecimal selfPayAmount;
    private List<OpenOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime expireAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpenOrderItemResponse {
        private String externalProductId;
        private String name;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private BigDecimal insuranceAmount;
        private BigDecimal selfPayAmount;
    }
}
