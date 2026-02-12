package com.medpay.open.repository;

import com.medpay.open.domain.WebhookDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WebhookDeliveryLogRepository extends JpaRepository<WebhookDeliveryLog, Long> {

    List<WebhookDeliveryLog> findByStatusInAndNextRetryAtBeforeOrderByCreatedAt(
            List<String> statuses, LocalDateTime before);

    List<WebhookDeliveryLog> findByStatusAndRetryCountLessThanOrderByCreatedAt(
            String status, int maxRetries);
}
