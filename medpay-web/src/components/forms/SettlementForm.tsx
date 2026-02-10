import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileBarChart, Loader2 } from 'lucide-react';
import { settlementSchema } from '@/lib/validators';
import type { SettlementFormValues } from '@/lib/validators';
import type { HospitalResponse } from '@/types/hospital';
import { cn } from '@/lib/utils';

interface SettlementFormProps {
  hospitals?: HospitalResponse[];
  onSubmit: (data: SettlementFormValues) => Promise<void>;
  loading?: boolean;
}

export default function SettlementForm({
  hospitals = [],
  onSubmit,
  loading = false,
}: SettlementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      hospitalId: '',
      startDate: '',
      endDate: '',
      notes: '',
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
      {/* Hospital */}
      <div>
        <label htmlFor="settle-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
          医院 <span className="text-red-400">*</span>
        </label>
        {hospitals.length > 0 ? (
          <select
            id="settle-hospital"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
          >
            <option value="">请选择医院</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="settle-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
        )}
        {errors.hospitalId && (
          <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Start Date */}
        <div>
          <label htmlFor="settle-start" className="mb-1.5 block text-sm font-medium text-gray-700">
            开始日期 <span className="text-red-400">*</span>
          </label>
          <input
            id="settle-start"
            type="date"
            {...register('startDate')}
            className={inputCls(!!errors.startDate)}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="settle-end" className="mb-1.5 block text-sm font-medium text-gray-700">
            结束日期 <span className="text-red-400">*</span>
          </label>
          <input
            id="settle-end"
            type="date"
            {...register('endDate')}
            className={inputCls(!!errors.endDate)}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="settle-notes" className="mb-1.5 block text-sm font-medium text-gray-700">
          备注
        </label>
        <textarea
          id="settle-notes"
          rows={2}
          {...register('notes')}
          className={cn(inputCls(false), 'resize-none')}
          placeholder="备注信息（可选）"
        />
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileBarChart className="h-4 w-4" />
          )}
          {loading ? '生成中...' : '生成结算'}
        </button>
      </div>
    </form>
  );
}
