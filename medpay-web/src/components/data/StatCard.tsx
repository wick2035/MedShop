import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  trend?: number;
  className?: string;
}

function AnimatedCounter({
  value,
  prefix = '',
}: {
  value: number;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  const formatted =
    display >= 1000
      ? display.toLocaleString('zh-CN', {
          minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
          maximumFractionDigits: 2,
        })
      : display.toFixed(value % 1 !== 0 ? 2 : 0);

  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
    </span>
  );
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  prefix = '¥',
  trend,
  className,
}: StatCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-lg bg-white/70 backdrop-blur-sm',
        'border border-ivory-200/60 shadow-glass',
        'p-5 transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 font-display">
            <AnimatedCounter value={value} prefix={prefix} />
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50 text-sage-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          {isPositiveTrend && (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                +{Math.abs(trend).toFixed(1)}%
              </span>
            </>
          )}
          {isNegativeTrend && (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {trend.toFixed(1)}%
              </span>
            </>
          )}
          <span className="ml-1 text-xs text-gray-400">vs 上期</span>
        </div>
      )}

      {/* Decorative gradient */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sage-500/5" />
    </motion.div>
  );
}
