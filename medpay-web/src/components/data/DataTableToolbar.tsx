import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        'mb-4',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full rounded-md border border-ivory-200 bg-white py-2 pl-9 pr-3',
                'text-sm text-gray-700 placeholder:text-gray-400',
                'focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500/20',
                'transition-colors',
              )}
            />
          </div>
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
