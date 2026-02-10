import { cn } from '@/lib/utils';

const variantStyles = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full',
  rect: 'rounded-md',
} as const;

export interface SkeletonProps {
  className?: string;
  variant?: keyof typeof variantStyles;
}

function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-ivory-200 via-ivory-100 to-ivory-200',
        variantStyles[variant],
        className,
      )}
      style={{ backgroundSize: '200% 100%' }}
      aria-hidden="true"
    />
  );
}

Skeleton.displayName = 'Skeleton';

export { Skeleton };
