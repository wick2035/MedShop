package com.medpay.insurance.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class InsuranceCoverageResult {
    private BigDecimal totalAmount;
    private BigDecimal eligibleAmount;
    private BigDecimal deductibleAmount;
    private BigDecimal insurancePays;
    private BigDecimal patientCopay;
    private BigDecimal coverageRatio;
    private List<ItemDetail> itemDetails;

    @Data
    @Builder
    public static class ItemDetail {
        private String itemName;
        private String category;
        private BigDecimal amount;
        private BigDecimal eligibleAmount;
        private BigDecimal insurancePays;
        private BigDecimal patientPays;
    }
}
