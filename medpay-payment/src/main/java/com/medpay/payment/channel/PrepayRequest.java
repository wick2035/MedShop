package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PrepayRequest {
    private String transactionNo;
    private BigDecimal amount;
    private String description;
    private String notifyUrl;
    private int expireMinutes;
}
