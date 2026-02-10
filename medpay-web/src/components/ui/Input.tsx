import React from 'react';
import type { InputHTMLAttributes, ElementType } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-sage-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon className="h-4 w-4 text-sage-400" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800',
              'placeholder:text-sage-300',
              'transition-colors duration-150',
              'focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              Icon && 'pl-9',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-200',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
