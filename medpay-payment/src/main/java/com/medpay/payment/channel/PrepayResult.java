package com.medpay.payment.channel;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrepayResult {
    private boolean success;
    private String channelTransactionId;
    private String payUrl;
    private String qrCodeUrl;
    private String errorMessage;
}
