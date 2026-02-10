package com.medpay.notification.channel;

import com.medpay.notification.domain.Notification;

public interface NotificationChannel {

    String getChannelName();

    void send(Notification notification);
}
