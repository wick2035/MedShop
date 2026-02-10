import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked = false, onChange, className, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 select-none',
          props.disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors',
              'h-[18px] w-[18px]',
              checked
                ? 'border-sage-500 bg-sage-500 text-white'
                : 'border-ivory-300 bg-ivory-50',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-sage-200 peer-focus-visible:ring-offset-1',
            )}
          >
            {checked && <Check className="h-3 w-3" strokeWidth={3} />}
          </div>
        </div>
        {label && <span className="text-sm text-sage-700">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
