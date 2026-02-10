package com.medpay.common.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class OrderCancelledEvent extends DomainEvent {

    private UUID orderId;
    private String orderNo;
    private String cancelReason;

    public OrderCancelledEvent(UUID orderId, String orderNo, String cancelReason) {
        super("Order", orderId, "OrderCancelled");
        this.orderId = orderId;
        this.orderNo = orderNo;
        this.cancelReason = cancelReason;
    }
}
