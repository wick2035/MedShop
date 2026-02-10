package com.medpay.notification.channel;

import com.medpay.notification.domain.Notification;
import com.medpay.notification.domain.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InAppNotificationChannel implements NotificationChannel {

    private final NotificationRepository notificationRepository;

    @Override
    public String getChannelName() {
        return "IN_APP";
    }

    @Override
    public void send(Notification notification) {
        notification.setChannel(getChannelName());
        notificationRepository.save(notification);
        log.debug("In-app notification saved for user {}: {}", notification.getUserId(), notification.getTitle());
    }
}
