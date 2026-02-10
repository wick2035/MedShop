import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-ivory-300/50 bg-white p-6 shadow-sm',
        hover &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

Card.displayName = 'Card';

export { Card };
