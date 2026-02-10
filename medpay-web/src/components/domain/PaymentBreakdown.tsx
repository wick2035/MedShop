import { formatCurrency, cn } from '@/lib/utils';

interface PaymentBreakdownProps {
  totalAmount: number;
  insuranceAmount?: number;
  selfPayAmount?: number;
  discountAmount?: number;
  className?: string;
}

interface SegmentInfo {
  label: string;
  amount: number;
  color: string;
  bgClass: string;
}

export default function PaymentBreakdown({
  totalAmount,
  insuranceAmount = 0,
  selfPayAmount,
  discountAmount = 0,
  className,
}: PaymentBreakdownProps) {
  const computedSelfPay =
    selfPayAmount ?? totalAmount - insuranceAmount - discountAmount;

  const segments: SegmentInfo[] = [
    {
      label: '自付',
      amount: computedSelfPay,
      color: '#3D7A4A',
      bgClass: 'bg-sage-500',
    },
    {
      label: '医保',
      amount: insuranceAmount,
      color: '#7AAFC4',
      bgClass: 'bg-sky',
    },
    {
      label: '优惠',
      amount: discountAmount,
      color: '#C9A962',
      bgClass: 'bg-muted-gold',
    },
  ].filter((s) => s.amount > 0);

  const actualTotal = segments.reduce((s, seg) => s + seg.amount, 0);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Stacked horizontal bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-ivory-100">
        {segments.map((seg) => {
          const pct = actualTotal > 0 ? (seg.amount / actualTotal) * 100 : 0;
          return (
            <div
              key={seg.label}
              className={cn('h-full transition-all', seg.bgClass)}
              style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : 0 }}
              title={`${seg.label}: ${formatCurrency(seg.amount)}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((seg) => {
          const pct =
            actualTotal > 0 ? ((seg.amount / actualTotal) * 100).toFixed(1) : '0';
          return (
            <div key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-600">{seg.label}</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(seg.amount)}
              </span>
              <span className="text-xs text-gray-400">({pct}%)</span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-ivory-200 pt-2">
        <span className="text-sm font-medium text-gray-500">合计</span>
        <span className="text-lg font-semibold text-gray-900 font-display">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
