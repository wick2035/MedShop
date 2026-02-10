package com.medpay.payment.event;

import com.medpay.common.event.DomainEvent;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class RefundSuccessEvent extends DomainEvent {

    private UUID orderId;
    private String refundNo;
    private BigDecimal refundAmount;
    private String refundType;

    public RefundSuccessEvent() {
        super();
    }

    public RefundSuccessEvent(UUID orderId, String refundNo, BigDecimal refundAmount, String refundType) {
        super("RefundRecord", orderId, "REFUND_SUCCESS");
        this.orderId = orderId;
        this.refundNo = refundNo;
        this.refundAmount = refundAmount;
        this.refundType = refundType;
    }
}
