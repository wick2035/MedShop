import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

export interface NotificationListParams {
  page?: number;
  size?: number;
}

export const notificationsApi = {
  /** List notifications for the current user with pagination */
  list(
    params?: NotificationListParams,
  ): Promise<PaginatedResponse<Notification>> {
    return client
      .get('/api/v1/notifications', { params })
      .then((r) => r.data as PaginatedResponse<Notification>);
  },

  /** Get the count of unread notifications */
  getUnreadCount(): Promise<number> {
    return client
      .get('/api/v1/notifications/unread-count')
      .then((r) => r.data as number);
  },

  /** Mark a single notification as read */
  markRead(id: string): Promise<void> {
    return client
      .put(`/api/v1/notifications/${id}/read`)
      .then(() => undefined);
  },

  /** Mark all notifications as read */
  markAllRead(): Promise<void> {
    return client
      .put('/api/v1/notifications/read-all')
      .then(() => undefined);
  },
};
