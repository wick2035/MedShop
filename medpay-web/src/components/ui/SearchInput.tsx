import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = '搜索...', className, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-sage-400" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-ivory-300 bg-ivory-50 py-2 pl-9 pr-8 text-sm text-sage-800',
            'placeholder:text-sage-300',
            'transition-colors duration-150',
            'focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200',
          )}
          {...props}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-sage-400 hover:text-sage-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
