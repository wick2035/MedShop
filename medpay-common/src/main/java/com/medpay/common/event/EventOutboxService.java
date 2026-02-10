package com.medpay.common.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventOutboxService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public void saveEvent(DomainEvent event) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize domain event: {}", event.getEventType(), e);
            throw new RuntimeException("Failed to serialize domain event", e);
        }

        jdbcTemplate.update(
                "INSERT INTO event_outbox (aggregate_type, aggregate_id, event_type, payload, status, created_at) " +
                        "VALUES (?, ?, ?, ?::jsonb, ?, ?)",
                event.getAggregateType(),
                event.getAggregateId(),
                event.getEventType(),
                payload,
                "PENDING",
                Timestamp.valueOf(LocalDateTime.now())
        );

        log.debug("Saved outbox event: type={}, aggregateId={}", event.getEventType(), event.getAggregateId());
    }
}
