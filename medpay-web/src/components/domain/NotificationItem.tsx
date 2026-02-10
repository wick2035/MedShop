import { Bell, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationData {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
}

interface NotificationItemProps {
  notification: NotificationData;
  onRead?: (id: string) => void;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertCircle,
  ERROR: XCircle,
};

const TYPE_COLORS: Record<string, string> = {
  INFO: 'text-sky bg-sky/10',
  SUCCESS: 'text-sage-500 bg-sage-50',
  WARNING: 'text-muted-gold bg-muted-gold/10',
  ERROR: 'text-terracotta bg-terracotta/10',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  if (isNaN(date)) return '--';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '刚刚';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}周前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;

  return `${Math.floor(months / 12)}年前`;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const isUnread = notification.status === 'UNREAD';
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const iconColor = TYPE_COLORS[notification.type] ?? 'text-gray-400 bg-gray-100';

  const handleClick = () => {
    if (isUnread && onRead) {
      onRead(notification.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors',
        isUnread
          ? 'border-l-[3px] border-l-sage-500 bg-sage-50/30 hover:bg-sage-50/50'
          : 'border-l-[3px] border-l-transparent hover:bg-ivory-50',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          iconColor,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm line-clamp-1',
              isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
            )}
          >
            {notification.title}
          </h4>
          {isUnread && (
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-sage-500" />
          )}
        </div>
        <p
          className={cn(
            'mt-0.5 text-xs line-clamp-2',
            isUnread ? 'text-gray-600' : 'text-gray-400',
          )}
        >
          {notification.content}
        </p>
        <p className="mt-1 text-[10px] text-gray-400">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
