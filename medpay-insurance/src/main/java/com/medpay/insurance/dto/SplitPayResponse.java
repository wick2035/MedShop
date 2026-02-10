package com.medpay.insurance.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SplitPayResponse {
    private List<SplitDetail> splits;
    private String selfPayTransactionNo;

    @Data
    @Builder
    public static class SplitDetail {
        private String payerType;
        private BigDecimal amount;
        private String status;
    }
}
