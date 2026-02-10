import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Bell, BellOff, CheckCheck, Mail, MailOpen } from 'lucide-react';
import { toast } from 'sonner';

import type { Notification } from '@/types/notification';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { notificationsApi } from '@/api/notifications.api';
import { formatDateTime } from '@/lib/utils';

export default function NotificationListPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.list({ page, size: 20 });
      if (Array.isArray(result)) {
        setNotifications(result);
        setTotalPages(1);
      } else {
        const paginated = result as PaginatedResponse<Notification>;
        setNotifications(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently ignore unread count errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Badge variant="sage" size="sm">{type}</Badge>;
      case 'PAYMENT':
        return <Badge variant="gold" size="sm">{type}</Badge>;
      case 'REFUND':
        return <Badge variant="terracotta" size="sm">{type}</Badge>;
      case 'SYSTEM':
        return <Badge variant="sky" size="sm">{type}</Badge>;
      default:
        return <Badge variant="default" size="sm">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchNotifications}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              icon={<CheckCheck className="h-4 w-4" />}
              loading={markingAll}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <BellOff className="h-12 w-12 text-gray-300" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              className={`rounded-lg border p-4 transition-colors ${
                n.read
                  ? 'border-ivory-200/60 bg-white/50'
                  : 'border-sage-200 bg-white/80 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.read ? 'bg-gray-100' : 'bg-sage-50'}`}>
                  {n.read ? (
                    <MailOpen className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-sage-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-medium ${n.read ? 'text-gray-600' : 'text-sage-800'}`}>
                      {n.title}
                    </h3>
                    {getTypeBadge(n.type)}
                    {!n.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-terracotta-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{n.content}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
                    {n.channel && (
                      <Badge variant="default" size="sm">{n.channel}</Badge>
                    )}
                    {n.relatedEntityType && n.relatedEntityId && (
                      <span className="text-xs text-gray-400">
                        {n.relatedEntityType}: {n.relatedEntityId.substring(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={markingId === n.id}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </PageContainer>
  );
}
