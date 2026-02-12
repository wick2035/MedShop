package com.medpay.open.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medpay.open.domain.ApiClient;
import com.medpay.open.domain.WebhookDeliveryLog;
import com.medpay.open.repository.ApiClientRepository;
import com.medpay.open.repository.WebhookDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private static final int MAX_RETRIES = 4;
    private static final int[] RETRY_DELAYS_MINUTES = {1, 5, 30, 120};

    private final WebhookDeliveryLogRepository deliveryLogRepository;
    private final ApiClientRepository apiClientRepository;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Transactional
    public void enqueueWebhook(String clientId, String eventType, Map<String, Object> data) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "eventType", eventType,
                    "timestamp", LocalDateTime.now().toString(),
                    "data", data
            ));

            WebhookDeliveryLog deliveryLog = new WebhookDeliveryLog();
            deliveryLog.setClientId(clientId);
            deliveryLog.setEventType(eventType);
            deliveryLog.setPayload(payload);
            deliveryLog.setStatus("PENDING");
            deliveryLog.setNextRetryAt(LocalDateTime.now());
            deliveryLogRepository.save(deliveryLog);

            log.info("Webhook enqueued: clientId={}, eventType={}", clientId, eventType);
        } catch (Exception e) {
            log.error("Failed to enqueue webhook: clientId={}, eventType={}", clientId, eventType, e);
        }
    }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void processWebhookQueue() {
        List<WebhookDeliveryLog> pending = deliveryLogRepository
                .findByStatusInAndNextRetryAtBeforeOrderByCreatedAt(
                        List.of("PENDING", "FAILED"), LocalDateTime.now());

        for (WebhookDeliveryLog deliveryLog : pending) {
            if (deliveryLog.getRetryCount() >= MAX_RETRIES) {
                deliveryLog.setStatus("ABANDONED");
                deliveryLogRepository.save(deliveryLog);
                log.warn("Webhook abandoned after {} retries: id={}, clientId={}",
                        MAX_RETRIES, deliveryLog.getId(), deliveryLog.getClientId());
                continue;
            }

            deliverWebhook(deliveryLog);
        }
    }

    private void deliverWebhook(WebhookDeliveryLog deliveryLog) {
        ApiClient client = apiClientRepository.findByClientId(deliveryLog.getClientId())
                .orElse(null);

        if (client == null || client.getCallbackUrl() == null || client.getCallbackUrl().isBlank()) {
            deliveryLog.setStatus("ABANDONED");
            deliveryLogRepository.save(deliveryLog);
            log.warn("No callback URL for client: {}", deliveryLog.getClientId());
            return;
        }

        try {
            String signature = computeHmac(deliveryLog.getPayload(), client.getCallbackSecret());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(client.getCallbackUrl()))
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Signature", signature)
                    .header("X-Event-Type", deliveryLog.getEventType())
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(deliveryLog.getPayload(), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            deliveryLog.setHttpStatus(response.statusCode());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                deliveryLog.setStatus("SUCCESS");
                log.info("Webhook delivered: id={}, clientId={}, httpStatus={}",
                        deliveryLog.getId(), deliveryLog.getClientId(), response.statusCode());
            } else {
                handleRetry(deliveryLog);
                log.warn("Webhook delivery failed: id={}, httpStatus={}", deliveryLog.getId(), response.statusCode());
            }
        } catch (Exception e) {
            handleRetry(deliveryLog);
            log.error("Webhook delivery error: id={}, error={}", deliveryLog.getId(), e.getMessage());
        }

        deliveryLogRepository.save(deliveryLog);
    }

    private void handleRetry(WebhookDeliveryLog deliveryLog) {
        int retryCount = deliveryLog.getRetryCount() + 1;
        deliveryLog.setRetryCount(retryCount);

        if (retryCount >= MAX_RETRIES) {
            deliveryLog.setStatus("ABANDONED");
        } else {
            deliveryLog.setStatus("FAILED");
            int delayMinutes = RETRY_DELAYS_MINUTES[Math.min(retryCount - 1, RETRY_DELAYS_MINUTES.length - 1)];
            deliveryLog.setNextRetryAt(LocalDateTime.now().plusMinutes(delayMinutes));
        }
    }

    private String computeHmac(String payload, String secret) {
        if (secret == null || secret.isBlank()) return "no-secret";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            log.error("Failed to compute HMAC", e);
            return "hmac-error";
        }
    }

    public void notifyOrderPaid(String clientId, String externalOrderId, String medpayOrderNo,
                                 String transactionNo, java.math.BigDecimal amount) {
        enqueueWebhook(clientId, "ORDER_PAID", Map.of(
                "externalOrderId", externalOrderId,
                "medpayOrderNo", medpayOrderNo,
                "status", "PAID",
                "totalAmount", amount,
                "transactionNo", transactionNo,
                "paidAt", LocalDateTime.now().toString()
        ));
    }

    public void notifyOrderCancelled(String clientId, String externalOrderId, String medpayOrderNo, String reason) {
        enqueueWebhook(clientId, "ORDER_CANCELLED", Map.of(
                "externalOrderId", externalOrderId,
                "medpayOrderNo", medpayOrderNo,
                "status", "CANCELLED",
                "reason", reason != null ? reason : "",
                "cancelledAt", LocalDateTime.now().toString()
        ));
    }

    public void notifyRefundCompleted(String clientId, String externalOrderId, String refundNo,
                                       java.math.BigDecimal amount) {
        enqueueWebhook(clientId, "REFUND_COMPLETED", Map.of(
                "externalOrderId", externalOrderId,
                "refundNo", refundNo,
                "refundAmount", amount,
                "status", "REFUND_COMPLETED",
                "refundedAt", LocalDateTime.now().toString()
        ));
    }
}
