package com.medpay.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPollerScheduler {

    private final JdbcTemplate jdbcTemplate;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void pollOutbox() {
        List<Map<String, Object>> events = jdbcTemplate.queryForList(
                "SELECT id, aggregate_type, aggregate_id, event_type, payload " +
                        "FROM event_outbox WHERE status = 'PENDING' ORDER BY created_at LIMIT 50");

        for (Map<String, Object> event : events) {
            try {
                Object id = event.get("id");
                String eventType = (String) event.get("event_type");

                jdbcTemplate.update("UPDATE event_outbox SET status = 'PUBLISHED', published_at = NOW() WHERE id = ?", id);

                log.debug("Published outbox event: id={}, type={}", id, eventType);
            } catch (Exception e) {
                log.error("Failed to publish outbox event: {}", event.get("id"), e);
            }
        }

        if (!events.isEmpty()) {
            log.info("Polled and published {} outbox events", events.size());
        }
    }
}
