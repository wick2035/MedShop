import { cn, formatCurrency } from '@/lib/utils';

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

export interface AmountDisplayProps {
  amount: number;
  size?: keyof typeof sizeStyles;
  className?: string;
  insuranceAmount?: number;
  selfPayAmount?: number;
}

function AmountDisplay({
  amount,
  size = 'md',
  className,
  insuranceAmount,
  selfPayAmount,
}: AmountDisplayProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'font-mono font-semibold text-sage-800',
          sizeStyles[size],
        )}
      >
        {formatCurrency(amount)}
      </span>
      {(insuranceAmount !== undefined || selfPayAmount !== undefined) && (
        <div className="mt-1 flex items-center gap-3 text-xs text-sage-500">
          {insuranceAmount !== undefined && (
            <span>
              医保: <span className="font-mono">{formatCurrency(insuranceAmount)}</span>
            </span>
          )}
          {selfPayAmount !== undefined && (
            <span>
              自付: <span className="font-mono">{formatCurrency(selfPayAmount)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

AmountDisplay.displayName = 'AmountDisplay';

export { AmountDisplay };
