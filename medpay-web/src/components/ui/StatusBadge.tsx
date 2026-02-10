import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from '@/lib/constants';
import type { OrderStatus, PaymentStatus, AppointmentStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'appointment';
  className?: string;
}

function StatusBadge({ status, type = 'order', className }: StatusBadgeProps) {
  let label: string;
  let colorClasses: string;

  switch (type) {
    case 'payment': {
      label =
        PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
      colorClasses =
        PAYMENT_STATUS_COLORS[status as PaymentStatus] ??
        'bg-gray-100 text-gray-700';
      break;
    }
    case 'appointment': {
      label =
        APPOINTMENT_STATUS_LABELS[status as AppointmentStatus] ?? status;
      colorClasses =
        APPOINTMENT_STATUS_COLORS[status as AppointmentStatus] ??
        'bg-gray-100 text-gray-700';
      break;
    }
    case 'order':
    default: {
      label =
        ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
      colorClasses =
        ORDER_STATUS_COLORS[status as OrderStatus] ??
        'bg-gray-100 text-gray-700';
      break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-tight',
        colorClasses,
        className,
      )}
    >
      {label}
    </span>
  );
}

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
