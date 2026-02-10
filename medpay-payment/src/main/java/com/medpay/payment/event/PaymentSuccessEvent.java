package com.medpay.payment.event;

import com.medpay.common.event.DomainEvent;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class PaymentSuccessEvent extends DomainEvent {

    private UUID orderId;
    private String transactionNo;
    private BigDecimal amount;
    private UUID patientId;

    public PaymentSuccessEvent() {
        super();
    }

    public PaymentSuccessEvent(UUID orderId, String transactionNo, BigDecimal amount, UUID patientId) {
        super("PaymentTransaction", orderId, "PAYMENT_SUCCESS");
        this.orderId = orderId;
        this.transactionNo = transactionNo;
        this.amount = amount;
        this.patientId = patientId;
    }
}
