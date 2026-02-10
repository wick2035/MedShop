import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { OrderStatus } from '@/types/enums';

interface OrderStatusTimelineProps {
  currentStatus: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

interface TimelineStep {
  status: OrderStatus;
  label: string;
  time?: string;
  state: 'completed' | 'current' | 'future';
}

export default function OrderStatusTimeline({
  currentStatus,
  paidAt,
  completedAt,
  cancelledAt,
  createdAt,
}: OrderStatusTimelineProps) {
  const steps = useMemo<TimelineStep[]>(() => {
    const isCancelled =
      currentStatus === OrderStatus.CANCELLED;
    const isRefunded =
      currentStatus === OrderStatus.REFUNDED ||
      currentStatus === OrderStatus.REFUND_REQUESTED ||
      currentStatus === OrderStatus.REFUND_APPROVED;
    const isPartialRefund =
      currentStatus === OrderStatus.PARTIALLY_REFUNDED ||
      currentStatus === OrderStatus.PARTIAL_REFUND_REQUESTED ||
      currentStatus === OrderStatus.PARTIAL_REFUND_APPROVED;

    // Normal flow
    const normalFlow: OrderStatus[] = [
      OrderStatus.CREATED,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
    ];

    let flow: OrderStatus[];

    if (isCancelled) {
      flow = [OrderStatus.CREATED, OrderStatus.CANCELLED];
    } else if (isRefunded) {
      flow = [
        OrderStatus.CREATED,
        OrderStatus.PAID,
        OrderStatus.REFUND_REQUESTED,
        OrderStatus.REFUNDED,
      ];
    } else if (isPartialRefund) {
      flow = [
        OrderStatus.CREATED,
        OrderStatus.PAID,
        OrderStatus.PARTIAL_REFUND_REQUESTED,
        OrderStatus.PARTIALLY_REFUNDED,
      ];
    } else {
      flow = normalFlow;
    }

    const currentIdx = flow.indexOf(currentStatus as OrderStatus);

    return flow.map((status, idx) => {
      let state: 'completed' | 'current' | 'future' = 'future';
      if (idx < currentIdx) state = 'completed';
      else if (idx === currentIdx) state = 'current';

      let time: string | undefined;
      if (status === OrderStatus.CREATED) time = createdAt;
      else if (status === OrderStatus.PAID) time = paidAt;
      else if (status === OrderStatus.COMPLETED) time = completedAt;
      else if (status === OrderStatus.CANCELLED) time = cancelledAt;

      return {
        status,
        label: ORDER_STATUS_LABELS[status] ?? status,
        time,
        state,
      };
    });
  }, [currentStatus, paidAt, completedAt, cancelledAt, createdAt]);

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.status} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all',
                  step.state === 'completed' &&
                    'border-sage-500 bg-sage-500 text-white',
                  step.state === 'current' &&
                    'border-sage-500 bg-white text-sage-500 ring-4 ring-sage-500/20 animate-pulse',
                  step.state === 'future' &&
                    'border-gray-200 bg-gray-50 text-gray-300',
                )}
              >
                {step.state === 'completed' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[28px]',
                    step.state === 'completed' ? 'bg-sage-500' : 'bg-gray-200',
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-5', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-7',
                  step.state === 'completed' && 'text-gray-800',
                  step.state === 'current' && 'text-sage-600 font-semibold',
                  step.state === 'future' && 'text-gray-400',
                )}
              >
                {step.label}
              </p>
              {step.time && (
                <p className="text-xs text-gray-400">
                  {formatDateTime(step.time)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
