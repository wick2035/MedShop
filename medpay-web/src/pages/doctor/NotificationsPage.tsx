import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCheck,
  Clock,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { Notification } from '@/types/notification';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { notificationsApi } from '@/api/notifications.api';
import { cn, formatDateTime } from '@/lib/utils';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'APPOINTMENT':
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case 'PRESCRIPTION':
      return <FileText className="h-5 w-5 text-emerald-500" />;
    case 'ALERT':
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case 'SYSTEM':
      return <Bell className="h-5 w-5 text-sage-500" />;
    default:
      return <Bell className="h-5 w-5 text-sage-400" />;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.list();
      setNotifications(data.content ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '加载通知失败',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(notificationId: string) {
    try {
      await notificationsApi.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
    } catch {
      // silently fail for single mark read
    }
  }

  async function handleMarkAllRead() {
    setMarkingAllRead(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '标记全部已读失败',
      );
    } finally {
      setMarkingAllRead(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="通知"
            subtitle={
              unreadCount > 0
                ? `${unreadCount} 条未读通知`
                : '全部已读'
            }
            breadcrumbs={[
              { label: '仪表盘', href: '/doctor' },
              { label: '通知' },
            ]}
            actions={
              unreadCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={markingAllRead}
                  onClick={handleMarkAllRead}
                  icon={<CheckCheck className="h-4 w-4" />}
                >
                  全部标为已读
                </Button>
              ) : undefined
            }
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
              >
                重试
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sage-500">
              <BellOff className="mb-3 h-12 w-12 text-sage-300" />
              <p className="text-lg font-medium">暂无通知</p>
              <p className="mt-1 text-sm text-sage-400">
                暂无新通知，通知消息将显示在此处
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ivory-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkRead(notification.id);
                    }
                  }}
                  className={cn(
                    'flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-ivory-50',
                    !notification.read && 'bg-sage-50/30',
                  )}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm',
                          notification.read
                            ? 'text-sage-600'
                            : 'font-medium text-sage-800',
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-sage-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-sage-500 line-clamp-2">
                      {notification.content}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-sage-400">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(notification.createdAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
