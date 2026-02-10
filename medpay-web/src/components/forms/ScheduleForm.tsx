import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { scheduleSchema } from '@/lib/validators';
import type { ScheduleFormValues } from '@/lib/validators';
import type { DoctorResponse } from '@/types/doctor';
import type { DepartmentResponse } from '@/types/department';
import { cn } from '@/lib/utils';

interface ScheduleFormProps {
  initialData?: Partial<ScheduleFormValues>;
  doctors?: DoctorResponse[];
  departments?: DepartmentResponse[];
  onSubmit: (data: ScheduleFormValues) => Promise<void>;
  loading?: boolean;
}

export default function ScheduleForm({
  initialData,
  doctors = [],
  departments = [],
  onSubmit,
  loading = false,
}: ScheduleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      doctorId: '',
      departmentId: '',
      hospitalId: '',
      date: '',
      startTime: '',
      endTime: '',
      maxAppointments: 10,
      ...initialData,
    },
  });

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Doctor */}
        <div>
          <label htmlFor="sched-doctor" className="mb-1.5 block text-sm font-medium text-gray-700">
            医生 <span className="text-red-400">*</span>
          </label>
          {doctors.length > 0 ? (
            <select
              id="sched-doctor"
              {...register('doctorId')}
              className={inputCls(!!errors.doctorId)}
            >
              <option value="">请选择医生</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName} - {doc.title}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="sched-doctor"
              type="text"
              {...register('doctorId')}
              className={inputCls(!!errors.doctorId)}
              placeholder="请输入医生 ID"
            />
          )}
          {errors.doctorId && (
            <p className="mt-1 text-xs text-red-500">{errors.doctorId.message}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="sched-dept" className="mb-1.5 block text-sm font-medium text-gray-700">
            科室 <span className="text-red-400">*</span>
          </label>
          {departments.length > 0 ? (
            <select
              id="sched-dept"
              {...register('departmentId')}
              className={inputCls(!!errors.departmentId)}
            >
              <option value="">请选择科室</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="sched-dept"
              type="text"
              {...register('departmentId')}
              className={inputCls(!!errors.departmentId)}
              placeholder="请输入科室 ID"
            />
          )}
          {errors.departmentId && (
            <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label htmlFor="sched-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="sched-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="sched-date" className="mb-1.5 block text-sm font-medium text-gray-700">
            日期 <span className="text-red-400">*</span>
          </label>
          <input
            id="sched-date"
            type="date"
            {...register('date')}
            className={inputCls(!!errors.date)}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="sched-start" className="mb-1.5 block text-sm font-medium text-gray-700">
            开始时间 <span className="text-red-400">*</span>
          </label>
          <input
            id="sched-start"
            type="time"
            {...register('startTime')}
            className={inputCls(!!errors.startTime)}
          />
          {errors.startTime && (
            <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="sched-end" className="mb-1.5 block text-sm font-medium text-gray-700">
            结束时间 <span className="text-red-400">*</span>
          </label>
          <input
            id="sched-end"
            type="time"
            {...register('endTime')}
            className={inputCls(!!errors.endTime)}
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
          )}
        </div>

        {/* Max Appointments */}
        <div>
          <label htmlFor="sched-max" className="mb-1.5 block text-sm font-medium text-gray-700">
            最大预约数 <span className="text-red-400">*</span>
          </label>
          <input
            id="sched-max"
            type="number"
            min="1"
            {...register('maxAppointments')}
            className={inputCls(!!errors.maxAppointments)}
            placeholder="10"
          />
          {errors.maxAppointments && (
            <p className="mt-1 text-xs text-red-500">{errors.maxAppointments.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-5 py-2.5',
            'bg-sage-500 text-white text-sm font-medium',
            'hover:bg-sage-600 active:bg-sage-700 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:ring-offset-2',
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
