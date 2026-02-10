import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Plus,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type { DoctorScheduleResponse } from '@/types/schedule';
import type { PrescriptionResponse } from '@/types/prescription';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { schedulesApi } from '@/api/schedules.api';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { formatTime, formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const formattedDate = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const [scheduleData, prescriptionData] = await Promise.all([
          schedulesApi.list({ doctorId: user.id, date: todayStr }),
          prescriptionsApi.listByDoctor(user.id),
        ]);
        setSchedules(scheduleData);
        setPendingPrescriptions(
          prescriptionData.filter((p) => p.status === 'PENDING'),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, todayStr]);

  const totalAppointmentsToday = schedules.reduce(
    (sum, s) => sum + s.bookedCount,
    0,
  );
  const completedToday = schedules.filter(
    (s) => s.status === 'COMPLETED',
  ).length;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-sage-800">
            Dr. {user?.fullName ?? 'Doctor'}
          </h1>
          <p className="mt-1 text-sage-600/70">{formattedDate}</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-ivory-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600/70">Today's Appointments</p>
                <p className="text-2xl font-semibold text-sage-800">
                  {totalAppointmentsToday}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ivory-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <ClipboardList className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600/70">Pending Prescriptions</p>
                <p className="text-2xl font-semibold text-sage-800">
                  {pendingPrescriptions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ivory-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-sage-600/70">Completed Today</p>
                <p className="text-2xl font-semibold text-sage-800">
                  {completedToday}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          variants={itemVariants}
          className="mb-8 rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-ivory-200 px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-sage-800">
              Today's Schedule
            </h2>
            <Link to="/doctor/schedules">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-sage-500">
              <Clock className="mb-3 h-10 w-10 text-sage-300" />
              <p>No schedules for today</p>
            </div>
          ) : (
            <div className="divide-y divide-ivory-100">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-ivory-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50 text-sm font-medium text-sage-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sage-800">
                        {formatTime(schedule.timeSlotStart)} -{' '}
                        {formatTime(schedule.timeSlotEnd)}
                      </p>
                      <p className="text-sm text-sage-600/70">
                        {schedule.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-sage-700">
                      {schedule.bookedCount}/{schedule.maxPatients} patients
                    </p>
                    <p className="text-xs text-sage-500">
                      {schedule.maxPatients - schedule.bookedCount} slots
                      available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Prescriptions Preview */}
        {pendingPrescriptions.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="mb-8 rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-ivory-200 px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-sage-800">
                Pending Prescriptions
              </h2>
              <Link to="/doctor/prescriptions">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-ivory-100">
              {pendingPrescriptions.slice(0, 5).map((rx) => (
                <Link
                  key={rx.id}
                  to={`/doctor/prescriptions/${rx.id}`}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-ivory-50"
                >
                  <div>
                    <p className="text-sm font-medium text-sage-800">
                      {rx.prescriptionNo}
                    </p>
                    <p className="text-xs text-sage-500">
                      {rx.diagnosis} &middot; {formatCurrency(rx.totalAmount)}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Pending
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="mb-4 font-display text-lg font-semibold text-sage-800">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/doctor/schedules/new">
              <div className="group flex items-center gap-4 rounded-xl border border-ivory-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-sage-300 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 transition-colors group-hover:bg-sage-100">
                  <Plus className="h-6 w-6 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-sage-800">Create Schedule</p>
                  <p className="text-sm text-sage-600/70">
                    Set up new appointment slots
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/new">
              <div className="group flex items-center gap-4 rounded-xl border border-ivory-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-sage-300 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 transition-colors group-hover:bg-sage-100">
                  <FileText className="h-6 w-6 text-sage-600" />
                </div>
                <div>
                  <p className="font-medium text-sage-800">
                    Write Prescription
                  </p>
                  <p className="text-sm text-sage-600/70">
                    Create a new prescription
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
