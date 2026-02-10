package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentQueryResult {
    private String status;
    private BigDecimal paidAmount;
    private LocalDateTime paidAt;
}
