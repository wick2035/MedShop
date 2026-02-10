package com.medpay.notification.channel;

import com.medpay.notification.domain.Notification;
import com.medpay.notification.domain.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Mock SMS channel - logs instead of actually sending SMS.
 * Replace with real SMS provider (Aliyun SMS, Tencent Cloud SMS, etc.) in production.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SmsNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;

    @Override
    public String getChannelName() {
        return "SMS";
    }

    @Override
    public void send(Notification notification) {
        notification.setChannel(getChannelName());
        notificationRepository.save(notification);
        // Mock: just log
        log.info("[MOCK SMS] To user {}: {} - {}", notification.getUserId(), notification.getTitle(), notification.getContent());
    }
}
