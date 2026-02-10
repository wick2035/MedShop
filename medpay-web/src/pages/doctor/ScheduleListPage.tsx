import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import type { DoctorScheduleResponse } from '@/types/schedule';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { schedulesApi } from '@/api/schedules.api';
import { cn, formatDate, formatTime } from '@/lib/utils';

function getWeekRange(baseDate: Date): { start: Date; end: Date } {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatWeekDisplay(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}, ${end.getFullYear()}`;
}

function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScheduleListPage() {
  const user = useAuthStore((s) => s.user);
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const { start: weekStart, end: weekEnd } = getWeekRange(baseDate);

  const fetchSchedules = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await schedulesApi.list({
        doctorId: user.id,
      });
      // Filter by week range client-side
      const startStr = toDateStr(weekStart);
      const endStr = toDateStr(weekEnd);
      const filtered = data.filter(
        (s) => s.scheduleDate >= startStr && s.scheduleDate <= endStr,
      );
      setSchedules(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [user, weekOffset]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const schedulesByDate: Record<string, DoctorScheduleResponse[]> = {};
  for (const s of schedules) {
    const key = s.scheduleDate;
    if (!schedulesByDate[key]) schedulesByDate[key] = [];
    schedulesByDate[key].push(s);
  }

  const todayStr = toDateStr(new Date());

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="My Schedule"
            subtitle="Manage your appointment slots"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Schedule' },
            ]}
            actions={
              <Link to="/doctor/schedules/new">
                <Button icon={<Plus className="h-4 w-4" />}>
                  New Schedule
                </Button>
              </Link>
            }
          />
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center justify-between rounded-xl border border-ivory-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset((o) => o - 1)}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Prev
          </Button>
          <div className="flex items-center gap-2 text-sm font-medium text-sage-800">
            <Calendar className="h-4 w-4 text-sage-500" />
            {formatWeekDisplay(weekStart, weekEnd)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Week Calendar Grid */}
        <motion.div
          variants={itemVariants}
          className="mb-8 grid grid-cols-7 gap-2"
        >
          {weekDays.map((day) => {
            const dateStr = toDateStr(day);
            const isToday = dateStr === todayStr;
            const daySchedules = schedulesByDate[dateStr] ?? [];

            return (
              <div
                key={dateStr}
                className={cn(
                  'min-h-[120px] rounded-lg border p-2 transition-colors',
                  isToday
                    ? 'border-sage-300 bg-sage-50/50'
                    : 'border-ivory-200 bg-white/60',
                )}
              >
                <div className="mb-1 text-center">
                  <p className="text-xs text-sage-500">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isToday ? 'text-sage-700' : 'text-sage-600',
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-1">
                  {daySchedules.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        'rounded-md px-1.5 py-1 text-xs',
                        s.status === 'ACTIVE'
                          ? 'bg-sage-100 text-sage-700'
                          : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      <p className="font-medium">
                        {formatTime(s.timeSlotStart)}-{formatTime(s.timeSlotEnd)}
                      </p>
                      <p>
                        {s.bookedCount}/{s.maxPatients}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* List View */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          <div className="border-b border-ivory-200 px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-sage-800">
              Schedule Details
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSchedules}>
                Retry
              </Button>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sage-500">
              <Calendar className="mb-3 h-10 w-10 text-sage-300" />
              <p>No schedules this week</p>
              <Link to="/doctor/schedules/new" className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Create Schedule
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ivory-100 text-left text-xs font-medium uppercase tracking-wider text-sage-500">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Appointments</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="transition-colors hover:bg-ivory-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-sage-400" />
                          <span className="text-sm text-sage-800">
                            {formatDate(schedule.scheduleDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-sage-400" />
                          <span className="text-sm text-sage-700">
                            {formatTime(schedule.timeSlotStart)} -{' '}
                            {formatTime(schedule.timeSlotEnd)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-sage-400" />
                          <span className="text-sm text-sage-700">
                            {schedule.bookedCount} / {schedule.maxPatients}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            schedule.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : schedule.status === 'COMPLETED'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
