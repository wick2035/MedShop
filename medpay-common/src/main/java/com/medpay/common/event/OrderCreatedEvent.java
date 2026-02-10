package com.medpay.common.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class OrderCreatedEvent extends DomainEvent {

    private UUID orderId;
    private String orderNo;
    private UUID patientId;
    private UUID hospitalId;
    private String orderType;
    private BigDecimal totalAmount;

    public OrderCreatedEvent(UUID orderId, String orderNo, UUID patientId,
                             UUID hospitalId, String orderType, BigDecimal totalAmount) {
        super("Order", orderId, "OrderCreated");
        this.orderId = orderId;
        this.orderNo = orderNo;
        this.patientId = patientId;
        this.hospitalId = hospitalId;
        this.orderType = orderType;
        this.totalAmount = totalAmount;
    }
}
