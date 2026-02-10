import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, value, onChange, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-sage-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Calendar className="h-4 w-4 text-sage-400" />
          </div>
          <input
            ref={ref}
            id={inputId}
            type="date"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'w-full rounded-md border border-ivory-300 bg-ivory-50 py-2 pl-9 pr-3 text-sm text-sage-800',
              'transition-colors duration-150',
              'focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error &&
                'border-red-400 focus:border-red-400 focus:ring-red-200',
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
