package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentCallbackData {
    private String transactionNo;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paidAt;
    private String channelTransactionId;
}
