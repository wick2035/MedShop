package com.medpay.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DomainEvent {

    private UUID eventId = UUID.randomUUID();
    private String aggregateType;
    private UUID aggregateId;
    private String eventType;
    private LocalDateTime occurredAt = LocalDateTime.now();

    public DomainEvent(String aggregateType, UUID aggregateId, String eventType) {
        this.eventId = UUID.randomUUID();
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.occurredAt = LocalDateTime.now();
    }
}
