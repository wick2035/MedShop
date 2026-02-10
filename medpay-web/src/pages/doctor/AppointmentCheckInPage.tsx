import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  User,
} from 'lucide-react';
import type { OrderResponse } from '@/types/order';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { appointmentsApi } from '@/api/appointments.api';
import { formatDate, formatTime } from '@/lib/utils';

export default function AppointmentCheckInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getById(id);
      setAppointment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load appointment',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  async function handleCheckIn() {
    if (!id) return;
    setCheckingIn(true);
    setError(null);
    try {
      await appointmentsApi.checkIn(id);
      setSuccess(true);
      setTimeout(() => navigate('/doctor/patients'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error && !appointment) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/doctor/patients')}
            >
              Back to Patients
            </Button>
            <Button variant="primary" onClick={fetchAppointment}>
              Retry
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!appointment) return null;

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Patient Check-In"
            subtitle="Confirm patient arrival"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Patients', href: '/doctor/patients' },
              { label: 'Check-In' },
            ]}
            actions={
              <Button
                variant="ghost"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate('/doctor/patients')}
              >
                Back
              </Button>
            }
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </motion.div>
              <h2 className="mt-4 font-display text-xl font-semibold text-emerald-800">
                Check-In Successful
              </h2>
              <p className="mt-2 text-sm text-emerald-600">
                The patient has been checked in. Redirecting to patient list...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={itemVariants}
              className="mx-auto max-w-lg rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
            >
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mb-6 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
                  <User className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-sage-800">
                  Patient {appointment.patientId.slice(0, 8)}...
                </h3>
                <p className="text-sm text-sage-500">
                  Order: {appointment.orderNo}
                </p>
              </div>

              <div className="mb-6 space-y-3 rounded-lg bg-ivory-50 p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-sage-400" />
                  <div>
                    <p className="text-xs text-sage-500">Appointment Date</p>
                    <p className="text-sm font-medium text-sage-800">
                      {appointment.appointmentDate
                        ? formatDate(appointment.appointmentDate)
                        : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-sage-400" />
                  <div>
                    <p className="text-xs text-sage-500">Appointment Time</p>
                    <p className="text-sm font-medium text-sage-800">
                      {appointment.appointmentTimeStart
                        ? `${formatTime(appointment.appointmentTimeStart)} - ${formatTime(appointment.appointmentTimeEnd)}`
                        : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-sage-400" />
                  <div>
                    <p className="text-xs text-sage-500">Status</p>
                    <p className="text-sm font-medium text-sage-800">
                      {appointment.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/doctor/patients')}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={checkingIn}
                  onClick={handleCheckIn}
                  icon={<UserCheck className="h-4 w-4" />}
                >
                  Confirm Check-In
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageContainer>
  );
}
