import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Clock,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import type { AppointmentResponse } from '@/types/appointment';
import { AppointmentStatus } from '@/types/enums';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { appointmentsApi } from '@/api/appointments.api';
import { cn, formatTime } from '@/lib/utils';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/constants';

export default function PatientListPage() {
  const user = useAuthStore((s) => s.user);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.list({
        doctorId: user.doctorId ?? user.id,
        date: todayStr,
      });
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载患者失败');
    } finally {
      setLoading(false);
    }
  }, [user, todayStr]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function handleCheckIn(appointmentId: string) {
    setActionLoading(appointmentId);
    try {
      await appointmentsApi.checkIn(appointmentId);
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStartConsultation(appointmentId: string) {
    setActionLoading(appointmentId);
    try {
      await appointmentsApi.startConsultation(appointmentId);
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : '开始就诊失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(appointmentId: string) {
    setActionLoading(appointmentId);
    try {
      await appointmentsApi.complete(appointmentId);
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : '完成失败');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="今日患者" />
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="今日患者"
            subtitle={`${appointments.length} 个预约`}
            breadcrumbs={[
              { label: '仪表盘', href: '/doctor' },
              { label: '患者' },
            ]}
          />
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              关闭
            </button>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sage-500">
              <Users className="mb-3 h-12 w-12 text-sage-300" />
              <p className="text-lg font-medium">今天暂无患者预约</p>
              <p className="mt-1 text-sm text-sage-400">
                患者预约后将显示在此处
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ivory-100 text-left text-xs font-medium uppercase tracking-wider text-sage-500">
                    <th className="px-6 py-3">序号</th>
                    <th className="px-6 py-3">患者</th>
                    <th className="px-6 py-3">预约时间</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {appointments.map((appt) => {
                    const status = appt.status;
                    const statusLabel =
                      APPOINTMENT_STATUS_LABELS[status] ?? status;
                    const statusColor =
                      APPOINTMENT_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500';
                    const isActioning = actionLoading === appt.id;

                    return (
                      <tr
                        key={appt.id}
                        className="transition-colors hover:bg-ivory-50"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-700">
                            {appt.queueNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-sage-800">
                            患者 {appt.patientId.slice(0, 8)}
                          </p>
                          <p className="text-xs text-sage-500">
                            预约号：{appt.appointmentNo}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-sage-400" />
                            <span className="text-sm text-sage-700">
                              {appt.timeSlotStart
                                ? `${formatTime(appt.timeSlotStart)} - ${formatTime(appt.timeSlotEnd)}`
                                : '--'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                              statusColor,
                            )}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {status === AppointmentStatus.BOOKED && (
                              <Button
                                variant="outline"
                                size="sm"
                                loading={isActioning}
                                onClick={() => handleCheckIn(appt.id)}
                                icon={<UserCheck className="h-3.5 w-3.5" />}
                              >
                                签到
                              </Button>
                            )}
                            {status === AppointmentStatus.CHECKED_IN && (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={isActioning}
                                onClick={() => handleStartConsultation(appt.id)}
                                icon={<PlayCircle className="h-3.5 w-3.5" />}
                              >
                                开始就诊
                              </Button>
                            )}
                            {status === AppointmentStatus.IN_PROGRESS && (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={isActioning}
                                onClick={() => handleComplete(appt.id)}
                                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              >
                                完成
                              </Button>
                            )}
                            {status === AppointmentStatus.COMPLETED && (
                              <span className="text-xs text-sage-400">
                                已完成
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
