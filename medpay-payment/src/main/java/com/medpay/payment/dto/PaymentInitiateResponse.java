package com.medpay.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentInitiateResponse {
    private String transactionNo;
    private String payUrl;
    private String qrCodeUrl;
    private LocalDateTime expiresAt;
}
