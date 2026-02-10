import type { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-ivory-200 p-4">
          <Icon className="h-8 w-8 text-sage-400" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-sage-700">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-sage-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';

export { EmptyState };
