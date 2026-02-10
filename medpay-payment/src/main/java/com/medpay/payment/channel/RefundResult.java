package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RefundResult {
    private boolean success;
    private String channelRefundId;
    private LocalDateTime refundedAt;
    private String errorMessage;
}
