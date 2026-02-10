import { motion } from 'framer-motion';
import { ShoppingBag, Clock } from 'lucide-react';
import type { OrderResponse } from '@/types/order';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import type { OrderStatus, OrderType } from '@/types/enums';

interface OrderCardProps {
  order: OrderResponse;
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700';
  const typeLabel = ORDER_TYPE_LABELS[order.orderType as OrderType] ?? order.orderType;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(45, 97, 57, 0.10)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-lg bg-white border border-ivory-200/60 p-4 shadow-sm',
        'transition-colors',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-medium text-gray-800">
          {order.orderNo}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusColor,
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-ivory-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {typeLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <ShoppingBag className="h-3 w-3" />
            {order.items.length} 项
          </span>
        </div>
        <span className="text-base font-semibold text-gray-900 font-display">
          {formatCurrency(order.totalAmount)}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between border-t border-ivory-200/60 pt-2.5">
        <span className="text-xs text-gray-400">
          {order.patientName}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {formatDateTime(order.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
