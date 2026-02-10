import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  className?: string;
}

function RadioGroup({
  options,
  value,
  onChange,
  name,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        const radioId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={radioId}
            className="inline-flex cursor-pointer items-center gap-2 select-none"
          >
            <div className="relative">
              <input
                id={radioId}
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange?.(option.value)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  'flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors',
                  isSelected
                    ? 'border-sage-500'
                    : 'border-ivory-300 bg-ivory-50',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-sage-200 peer-focus-visible:ring-offset-1',
                )}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-sage-500" />
                )}
              </div>
            </div>
            <span className="text-sm text-sage-700">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
