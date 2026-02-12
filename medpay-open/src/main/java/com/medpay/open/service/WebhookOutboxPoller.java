package com.medpay.open.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medpay.open.domain.ExternalEntityMapping;
import com.medpay.open.repository.ExternalEntityMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Polls event_outbox for PUBLISHED events and delivers webhooks
 * to external systems that have order mappings.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookOutboxPoller {

    private final JdbcTemplate jdbcTemplate;
    private final WebhookService webhookService;
    private final ExternalEntityMappingRepository entityMappingRepository;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 8000)
    @Transactional
    public void pollPublishedEventsForWebhook() {
        // Read PUBLISHED events that haven't been webhook-delivered yet
        // We add a webhook_status column approach, but simpler: just scan recent PUBLISHED events
        // and check if they correspond to external orders
        List<Map<String, Object>> events = jdbcTemplate.queryForList(
                "SELECT id, aggregate_type, aggregate_id, event_type, payload " +
                        "FROM event_outbox WHERE status = 'PUBLISHED' AND webhook_sent = false " +
                        "ORDER BY published_at LIMIT 50");

        for (Map<String, Object> event : events) {
            try {
                Object id = event.get("id");
                String eventType = (String) event.get("event_type");
                String aggregateId = String.valueOf(event.get("aggregate_id"));

                boolean delivered = tryDeliverWebhook(eventType, aggregateId, event.get("payload"));

                // Mark as webhook_sent regardless (to avoid reprocessing)
                jdbcTemplate.update("UPDATE event_outbox SET webhook_sent = true WHERE id = ?", id);
            } catch (Exception e) {
                log.error("Failed to process webhook for outbox event: {}", event.get("id"), e);
            }
        }
    }

    private boolean tryDeliverWebhook(String eventType, String aggregateId, Object payload) {
        try {
            UUID orderId = UUID.fromString(aggregateId);
            ExternalEntityMapping mapping = entityMappingRepository.findByMedpayId(orderId).orElse(null);
            if (mapping == null || !"ORDER".equals(mapping.getEntityType())) {
                return false;
            }

            String clientId = mapping.getClientId();
            String externalOrderId = mapping.getExternalId();

            JsonNode payloadNode = null;
            if (payload instanceof String payloadStr) {
                payloadNode = objectMapper.readTree(payloadStr);
            }

            switch (eventType) {
                case "PAYMENT_SUCCESS" -> {
                    String txNo = payloadNode != null && payloadNode.has("transactionNo")
                            ? payloadNode.get("transactionNo").asText() : "";
                    BigDecimal amount = payloadNode != null && payloadNode.has("totalAmount")
                            ? new BigDecimal(payloadNode.get("totalAmount").asText()) : BigDecimal.ZERO;
                    String orderNo = getOrderNo(orderId);
                    webhookService.notifyOrderPaid(clientId, externalOrderId, orderNo, txNo, amount);
                    return true;
                }
                case "ORDER_CANCELLED" -> {
                    String reason = payloadNode != null && payloadNode.has("reason")
                            ? payloadNode.get("reason").asText() : "";
                    String orderNo = getOrderNo(orderId);
                    webhookService.notifyOrderCancelled(clientId, externalOrderId, orderNo, reason);
                    return true;
                }
                case "REFUND_SUCCESS" -> {
                    String refundNo = payloadNode != null && payloadNode.has("refundNo")
                            ? payloadNode.get("refundNo").asText() : "";
                    BigDecimal amount = payloadNode != null && payloadNode.has("refundAmount")
                            ? new BigDecimal(payloadNode.get("refundAmount").asText()) : BigDecimal.ZERO;
                    webhookService.notifyRefundCompleted(clientId, externalOrderId, refundNo, amount);
                    return true;
                }
                default -> {
                    return false;
                }
            }
        } catch (IllegalArgumentException e) {
            return false;
        } catch (Exception e) {
            log.warn("Failed to deliver webhook: type={}, aggregateId={}, error={}",
                    eventType, aggregateId, e.getMessage());
            return false;
        }
    }

    private String getOrderNo(UUID orderId) {
        try {
            List<Map<String, Object>> result = jdbcTemplate.queryForList(
                    "SELECT order_no FROM \"order\" WHERE id = ?", orderId);
            if (!result.isEmpty()) {
                return (String) result.get(0).get("order_no");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch orderNo for {}", orderId);
        }
        return "";
    }
}
