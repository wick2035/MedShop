import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DoctorScheduleResponse } from '@/types/schedule';
import { cn, formatTime } from '@/lib/utils';

interface ScheduleCalendarProps {
  schedules: DoctorScheduleResponse[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onSlotClick?: (schedule: DoctorScheduleResponse) => void;
}

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ScheduleCalendar({
  schedules,
  currentDate,
  onDateChange,
  onSlotClick,
}: ScheduleCalendarProps) {
  const monday = useMemo(() => getMonday(currentDate), [currentDate]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
    [monday],
  );

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, DoctorScheduleResponse[]>();
    for (const s of schedules) {
      const dateKey = s.date.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(s);
    }
    // Sort each day by start time
    for (const [, list] of map) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [schedules]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-lg bg-white border border-ivory-200/60 shadow-sm overflow-hidden">
      {/* Week navigation */}
      <div className="flex items-center justify-between border-b border-ivory-200 bg-ivory-50 px-4 py-3">
        <button
          onClick={() => onDateChange(addDays(monday, -7))}
          className="rounded-md p-1.5 text-gray-500 hover:bg-ivory-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}
        </span>
        <button
          onClick={() => onDateChange(addDays(monday, 7))}
          className="rounded-md p-1.5 text-gray-500 hover:bg-ivory-200 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-ivory-200/60">
        {weekDates.map((date, idx) => {
          const isToday = date === today;
          const daySchedules = schedulesByDate.get(date) ?? [];

          return (
            <div key={date} className="min-h-[140px]">
              {/* Day header */}
              <div
                className={cn(
                  'border-b border-ivory-200/60 px-2 py-2 text-center',
                  isToday && 'bg-sage-50',
                )}
              >
                <p className="text-[10px] text-gray-400">{WEEKDAY_LABELS[idx]}</p>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isToday ? 'text-sage-600' : 'text-gray-700',
                  )}
                >
                  {formatShortDate(date)}
                </p>
              </div>

              {/* Slots */}
              <div className="space-y-1 p-1.5">
                {daySchedules.length === 0 && (
                  <p className="py-3 text-center text-[10px] text-gray-300">
                    无排班
                  </p>
                )}
                {daySchedules.map((schedule) => {
                  const isFull =
                    schedule.currentAppointments >= schedule.maxAppointments;
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => onSlotClick?.(schedule)}
                      className={cn(
                        'w-full rounded px-1.5 py-1 text-left text-[11px] transition-colors',
                        isFull
                          ? 'bg-terracotta/10 text-terracotta hover:bg-terracotta/20'
                          : 'bg-sage-50 text-sage-700 hover:bg-sage-100',
                      )}
                    >
                      <p className="font-medium truncate">
                        {schedule.doctorName}
                      </p>
                      <p className="text-[10px] opacity-70">
                        {formatTime(schedule.startTime)}-{formatTime(schedule.endTime)}
                      </p>
                      <p className="text-[10px] opacity-60">
                        {schedule.currentAppointments}/{schedule.maxAppointments}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
