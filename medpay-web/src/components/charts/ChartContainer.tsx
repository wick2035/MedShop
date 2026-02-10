import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartContainer({
  title,
  subtitle,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white/70 backdrop-blur-sm',
        'border border-ivory-200/60 shadow-glass',
        'p-5',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 font-display">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
