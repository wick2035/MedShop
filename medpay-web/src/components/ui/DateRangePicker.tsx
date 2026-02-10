import { DatePicker } from './DatePicker';
import { cn } from '@/lib/utils';

export interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  className?: string;
}

function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex items-end gap-2', className)}>
      <DatePicker
        label="开始日期"
        value={startDate}
        onChange={onStartChange}
        max={endDate}
      />
      <span className="pb-2.5 text-sm text-sage-400">至</span>
      <DatePicker
        label="结束日期"
        value={endDate}
        onChange={onEndChange}
        min={startDate}
      />
    </div>
  );
}

DateRangePicker.displayName = 'DateRangePicker';

export { DateRangePicker };
