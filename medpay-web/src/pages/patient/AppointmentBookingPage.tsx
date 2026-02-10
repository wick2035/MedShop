import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { schedulesApi } from '@/api/schedules.api';
import { doctorsApi } from '@/api/doctors.api';
import { ordersApi } from '@/api/orders.api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { DoctorScheduleResponse } from '@/types/schedule';
import type { DoctorResponse } from '@/types/doctor';

export default function AppointmentBookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [schedule, setSchedule] = useState<DoctorScheduleResponse | null>(null);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!scheduleId) return;
      setLoading(true);
      setError(null);
      try {
        const sched = await schedulesApi.getById(scheduleId);
        setSchedule(sched);
        const doc = await doctorsApi.getById(sched.doctorId);
        setDoctor(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [scheduleId]);

  async function handleConfirmBooking() {
    if (!schedule || !doctor || !user) return;

    setBooking(true);
    try {
      const order = await ordersApi.createAppointment(
        {
          scheduleId: schedule.id,
          doctorId: schedule.doctorId,
        },
        user.id,
      );
      toast.success('Appointment booked successfully!');
      navigate(`/patient/orders/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      toast.error(message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-40 rounded" />
        <div className="mt-6 skeleton-shimmer h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !schedule || !doctor) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Schedule not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="mb-6 font-display text-2xl font-semibold text-sage-800">
          Confirm Appointment
        </h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          {/* Doctor info */}
          <div className="mb-6 flex items-center gap-4 border-b border-ivory-200 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
              <User className="h-6 w-6 text-sage-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-sage-800">
                {doctor.fullName}
              </h2>
              <p className="text-sm text-sage-700/60">
                {doctor.title} - {doctor.specialty}
              </p>
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-sage-400" />
              <div>
                <p className="text-xs text-sage-700/60">Date</p>
                <p className="text-sm font-medium text-sage-800">
                  {formatDate(schedule.scheduleDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-sage-400" />
              <div>
                <p className="text-xs text-sage-700/60">Time</p>
                <p className="text-sm font-medium text-sage-800">
                  {formatTime(schedule.timeSlotStart)} - {formatTime(schedule.timeSlotEnd)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-sage-400" />
              <div>
                <p className="text-xs text-sage-700/60">Department</p>
                <p className="text-sm font-medium text-sage-800">
                  {doctor.specialty}
                </p>
              </div>
            </div>
          </div>

          {/* Fee */}
          <div className="mt-6 rounded-lg bg-ivory-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage-700">Consultation Fee</span>
              <span className="text-lg font-semibold text-sage-800">
                {formatCurrency(doctor.consultationFee)}
              </span>
            </div>
          </div>

          {/* Confirm button */}
          <div className="mt-8">
            <Button
              className="w-full"
              size="lg"
              loading={booking}
              onClick={handleConfirmBooking}
              icon={<CheckCircle className="h-5 w-5" />}
            >
              Confirm Booking
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
