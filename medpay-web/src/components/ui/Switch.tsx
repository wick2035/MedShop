import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked = false, onChange, className, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2.5 select-none',
          props.disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-9 rounded-full transition-colors duration-200',
              checked ? 'bg-sage-500' : 'bg-ivory-300',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-sage-200 peer-focus-visible:ring-offset-1',
            )}
          >
            <motion.div
              className="h-4 w-4 rounded-full bg-white shadow-xs"
              style={{ marginTop: 2 }}
              animate={{ x: checked ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
        {label && <span className="text-sm text-sage-700">{label}</span>}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export { Switch };
