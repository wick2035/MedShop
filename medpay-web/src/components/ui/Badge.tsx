import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-ivory-200 text-sage-700',
  sage: 'bg-sage-50 text-sage-700',
  terracotta: 'bg-orange-50 text-terracotta',
  gold: 'bg-amber-50 text-muted-gold',
  sky: 'bg-blue-50 text-sky',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-orange-50 text-orange-700',
  error: 'bg-red-50 text-red-700',
} as const;

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
} as const;

export interface BadgeProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  children: ReactNode;
  className?: string;
}

function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-tight',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

Badge.displayName = 'Badge';

export { Badge };
