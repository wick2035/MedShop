import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';

import type { DoctorScheduleResponse } from '@/types/schedule';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { schedulesApi } from '@/api/schedules.api';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(baseDate);
  monday.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleOverviewPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekBase, setWeekBase] = useState(new Date());

  const weekDates = getWeekDates(weekBase);
  const startDate = formatDateStr(weekDates[0]);
  const endDate = formatDateStr(weekDates[6]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schedulesApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        date: startDate,
      });
      setSchedules(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load schedules';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [weekBase, selectedHospitalId]);

  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };

  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };

  const getSchedulesForDate = (dateStr: string) =>
    schedules.filter((s) => s.scheduleDate === dateStr);

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchSchedules}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Schedule Overview"
        subtitle="Weekly view of all doctor schedules"
      />

      {/* Week Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-sage-800">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-7 gap-2"
        >
          {weekDates.map((date, idx) => {
            const dateStr = formatDateStr(date);
            const daySchedules = getSchedulesForDate(dateStr);
            const isToday = formatDateStr(new Date()) === dateStr;

            return (
              <motion.div
                key={dateStr}
                variants={itemVariants}
                className={`min-h-[200px] rounded-lg border p-3 ${
                  isToday
                    ? 'border-sage-400 bg-sage-50/50'
                    : 'border-ivory-200/60 bg-white/70'
                }`}
              >
                <div className="mb-2 text-center">
                  <p className="text-xs font-medium uppercase text-gray-400">{DAY_NAMES[idx]}</p>
                  <p
                    className={`text-lg font-semibold ${
                      isToday ? 'text-sage-700' : 'text-gray-700'
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {daySchedules.length === 0 && (
                    <p className="text-center text-xs text-gray-300">--</p>
                  )}
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="rounded bg-ivory-100 p-1.5 text-xs"
                    >
                      <p className="font-medium text-sage-700 truncate">
                        Dr. {schedule.doctorId.slice(0, 8)}
                      </p>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {schedule.timeSlotStart?.substring(0, 5)}-{schedule.timeSlotEnd?.substring(0, 5)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          schedule.bookedCount >= schedule.maxPatients
                            ? 'error'
                            : 'success'
                        }
                        size="sm"
                      >
                        {schedule.bookedCount}/{schedule.maxPatients}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageContainer>
  );
}
