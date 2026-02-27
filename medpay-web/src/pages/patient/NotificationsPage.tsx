import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notificationsApi } from '@/api/notifications.api';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.list();
      const items = 'content' in result ? result.content : (result as unknown as Notification[]);
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载通知失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Silently handle
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('已全部标为已读');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '标记已读失败');
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <PageHeader title="通知" subtitle={`${unreadCount} 条未读通知`} />
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              loading={markingAll}
              onClick={handleMarkAllRead}
              icon={<CheckCheck className="h-4 w-4" />}
            >
              全部标为已读
            </Button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchNotifications}>
            重试
          </Button>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="py-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">暂无通知</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'cursor-pointer p-4 transition-colors',
                !notification.read && 'border-l-4 border-l-sage-500 bg-sage-50/50',
              )}
            >
              <button
                className="flex w-full items-start gap-3 text-left"
                onClick={() => {
                  if (!notification.read) handleMarkAsRead(notification.id);
                }}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    notification.read ? 'bg-ivory-200' : 'bg-sage-100',
                  )}
                >
                  <Bell
                    className={cn(
                      'h-4 w-4',
                      notification.read ? 'text-sage-400' : 'text-sage-600',
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm',
                      notification.read
                        ? 'text-sage-700/70'
                        : 'font-medium text-sage-800',
                    )}
                  >
                    {notification.title}
                  </p>
                  {notification.content && (
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      {notification.content}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-xs text-sage-500">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>
                {!notification.read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage-500" />
                )}
              </button>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
