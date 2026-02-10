import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowLeft } from 'lucide-react';
import type { DoctorScheduleRequest } from '@/types/schedule';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { schedulesApi } from '@/api/schedules.api';

export default function ScheduleCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    scheduleDate: '',
    timeSlotStart: '',
    timeSlotEnd: '',
    maxPatients: 10,
    serviceId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxPatients' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formData.scheduleDate || !formData.timeSlotStart || !formData.timeSlotEnd) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.maxPatients < 1) {
      setError('Maximum patients must be at least 1.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const body: DoctorScheduleRequest = {
        doctorId: user.id,
        scheduleDate: formData.scheduleDate,
        timeSlotStart: formData.timeSlotStart,
        timeSlotEnd: formData.timeSlotEnd,
        maxPatients: formData.maxPatients,
        ...(formData.serviceId ? { serviceId: formData.serviceId } : {}),
      };

      await schedulesApi.create(body);
      setSuccess(true);
      setTimeout(() => navigate('/doctor/schedules'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Create Schedule"
            subtitle="Set up a new appointment time slot"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Schedule', href: '/doctor/schedules' },
              { label: 'Create' },
            ]}
            actions={
              <Button
                variant="ghost"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate('/doctor/schedules')}
              >
                Back
              </Button>
            }
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mx-auto max-w-xl rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
        >
          {success && (
            <div className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Schedule created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Schedule Date"
              name="scheduleDate"
              type="date"
              value={formData.scheduleDate}
              onChange={handleChange}
              icon={Calendar}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                name="timeSlotStart"
                type="time"
                value={formData.timeSlotStart}
                onChange={handleChange}
                icon={Clock}
                required
              />
              <Input
                label="End Time"
                name="timeSlotEnd"
                type="time"
                value={formData.timeSlotEnd}
                onChange={handleChange}
                icon={Clock}
                required
              />
            </div>

            <Input
              label="Maximum Patients"
              name="maxPatients"
              type="number"
              min={1}
              max={100}
              value={String(formData.maxPatients)}
              onChange={handleChange}
              icon={Users}
              required
            />

            <Input
              label="Service ID (optional)"
              name="serviceId"
              type="text"
              value={formData.serviceId}
              onChange={handleChange}
              placeholder="Leave blank for general consultation"
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/doctor/schedules')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={success}
                className="flex-1"
              >
                Create Schedule
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
