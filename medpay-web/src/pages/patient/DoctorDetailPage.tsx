import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { doctorsApi } from '@/api/doctors.api';
import { schedulesApi } from '@/api/schedules.api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { DoctorResponse } from '@/types/doctor';
import type { DoctorScheduleResponse } from '@/types/schedule';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [doc, sched] = await Promise.all([
          doctorsApi.getById(id),
          schedulesApi.list({ doctorId: id }),
        ]);
        setDoctor(doc);
        setSchedules(sched.filter((s) => s.status === 'AVAILABLE' && s.bookedCount < s.maxPatients));
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载医生详情失败');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-32 rounded" />
        <div className="mt-6 skeleton-shimmer h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || '未找到医生'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            返回
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
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Back button */}
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回医生列表
        </button>
      </motion.div>

      {/* Doctor profile */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar
              name={doctor.fullName}
              size="xl"
              className="h-24 w-24 shrink-0 text-2xl"
            />
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold text-sage-800">
                {doctor.fullName}
              </h1>
              <p className="mt-1 text-sage-600">{doctor.title}</p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-sage-700/70">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-sage-400" />
                  {doctor.specialty}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sage-400" />
                  {doctor.departmentId ? '科室' : '全科'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-muted-gold text-muted-gold" />
                  {doctor.ratingScore.toFixed(1)} 评分 ({doctor.totalRatings})
                </div>
              </div>

              <div className="mt-4">
                <Badge variant="terracotta" size="md">
                  问诊费：{formatCurrency(doctor.consultationFee)}
                </Badge>
              </div>

              {doctor.bio && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-sage-700">简介</h3>
                  <p className="text-sm leading-relaxed text-sage-700/70">
                    {doctor.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Available schedules */}
      <motion.div variants={itemVariants} className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold text-sage-800">
          可预约时段
        </h2>

        {schedules.length === 0 ? (
          <Card className="py-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-sage-300" />
            <p className="mt-3 text-sm text-sage-700/60">
              暂无可预约时段
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-sage-50">
                    <Calendar className="h-5 w-5 text-sage-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sage-800">
                      {formatDate(schedule.scheduleDate)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-sage-700/60">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(schedule.timeSlotStart)} - {formatTime(schedule.timeSlotEnd)}
                    </div>
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      {schedule.bookedCount} / {schedule.maxPatients} 已预约
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate(`/patient/book/${schedule.id}`)}
                >
                  预约
                </Button>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
