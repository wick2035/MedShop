package com.medpay.notification.service;

import com.medpay.notification.channel.NotificationChannel;
import com.medpay.notification.domain.Notification;
import com.medpay.notification.domain.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Map<String, NotificationChannel> channelMap;

    public NotificationService(NotificationRepository notificationRepository,
                               List<NotificationChannel> channels) {
        this.notificationRepository = notificationRepository;
        this.channelMap = channels.stream()
                .collect(Collectors.toMap(NotificationChannel::getChannelName, Function.identity()));
    }

    public void send(UUID userId, UUID hospitalId, String type, String title, String content,
                     String relatedEntityType, String relatedEntityId, String channel) {
        NotificationChannel notificationChannel = channelMap.get(channel);
        if (notificationChannel == null) {
            log.warn("Unknown notification channel: {}, falling back to IN_APP", channel);
            notificationChannel = channelMap.get("IN_APP");
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setHospitalId(hospitalId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);

        notificationChannel.send(notification);
    }

    public void sendInApp(UUID userId, UUID hospitalId, String type, String title, String content) {
        send(userId, hospitalId, type, title, content, null, null, "IN_APP");
    }

    @Transactional
    public boolean markAsRead(UUID notificationId, UUID userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        return updated > 0;
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }
}
