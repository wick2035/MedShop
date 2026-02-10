package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class RefundQueryResult {
    private String status;
    private BigDecimal refundedAmount;
}
