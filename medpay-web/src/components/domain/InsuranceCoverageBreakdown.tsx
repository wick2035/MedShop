import { formatCurrency, cn } from '@/lib/utils';

interface InsuranceResult {
  eligibleAmount: number;
  insuranceAmount: number;
  deductibleAmount: number;
  coverageRatio: number;
  patientCopay: number;
}

interface InsuranceCoverageBreakdownProps {
  result: InsuranceResult;
  className?: string;
}

export default function InsuranceCoverageBreakdown({
  result,
  className,
}: InsuranceCoverageBreakdownProps) {
  const coveragePct = Math.round(result.coverageRatio * 100);
  const circumference = 2 * Math.PI * 52;
  const strokeDasharray = `${(coveragePct / 100) * circumference} ${circumference}`;

  const items = [
    {
      label: '符合报销金额',
      value: result.eligibleAmount,
      color: 'text-sage-600',
    },
    {
      label: '医保支付',
      value: result.insuranceAmount,
      color: 'text-sky',
    },
    {
      label: '起付线/免赔额',
      value: result.deductibleAmount,
      color: 'text-muted-gold',
    },
    {
      label: '个人自付',
      value: result.patientCopay,
      color: 'text-terracotta',
    },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      {/* Donut chart */}
      <div className="flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#F5EFE5"
              strokeWidth="12"
            />
            {/* Coverage arc */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#7AAFC4"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-gray-900 font-display">
              {coveragePct}%
            </span>
            <span className="text-[10px] text-gray-400">报销比例</span>
          </div>
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-md bg-ivory-50/60 px-3 py-2"
          >
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={cn('text-sm font-medium', item.color)}>
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Coverage ratio bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
          <span>报销覆盖</span>
          <span>{coveragePct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-200">
          <div
            className="h-full rounded-full bg-sky transition-all duration-700 ease-out"
            style={{ width: `${coveragePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
