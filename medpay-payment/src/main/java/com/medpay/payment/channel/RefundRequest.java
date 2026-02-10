package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class RefundRequest {
    private String channelTransactionId;
    private String refundNo;
    private BigDecimal refundAmount;
    private BigDecimal totalAmount;
    private String reason;
}
