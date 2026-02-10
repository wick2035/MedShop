import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn('glass-panel rounded-lg shadow-glass p-6', className)}>
      {children}
    </div>
  );
}

GlassCard.displayName = 'GlassCard';

export { GlassCard };
