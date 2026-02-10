import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, Loader2 } from 'lucide-react';
import { reconciliationTriggerSchema } from '@/lib/validators';
import type { ReconciliationTriggerFormValues } from '@/lib/validators';
import { PAYMENT_CHANNEL_LABELS } from '@/lib/constants';
import { PaymentChannel } from '@/types/enums';
import type { HospitalResponse } from '@/types/hospital';
import { cn } from '@/lib/utils';

interface ReconciliationTriggerFormProps {
  hospitals?: HospitalResponse[];
  onSubmit: (data: ReconciliationTriggerFormValues) => Promise<void>;
  loading?: boolean;
}

export default function ReconciliationTriggerForm({
  hospitals = [],
  onSubmit,
  loading = false,
}: ReconciliationTriggerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReconciliationTriggerFormValues>({
    resolver: zodResolver(reconciliationTriggerSchema),
    defaultValues: {
      hospitalId: '',
      channel: '',
      reconciliationDate: '',
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
        <label htmlFor="recon-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
          医院 <span className="text-red-400">*</span>
        </label>
        {hospitals.length > 0 ? (
          <select
            id="recon-hospital"
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
            id="recon-hospital"
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

      {/* Channel */}
      <div>
        <label htmlFor="recon-channel" className="mb-1.5 block text-sm font-medium text-gray-700">
          支付渠道 <span className="text-red-400">*</span>
        </label>
        <select
          id="recon-channel"
          {...register('channel')}
          className={inputCls(!!errors.channel)}
        >
          <option value="">请选择渠道</option>
          {Object.values(PaymentChannel).map((ch) => (
            <option key={ch} value={ch}>
              {PAYMENT_CHANNEL_LABELS[ch]}
            </option>
          ))}
        </select>
        {errors.channel && (
          <p className="mt-1 text-xs text-red-500">{errors.channel.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="recon-date" className="mb-1.5 block text-sm font-medium text-gray-700">
          对账日期 <span className="text-red-400">*</span>
        </label>
        <input
          id="recon-date"
          type="date"
          {...register('reconciliationDate')}
          className={inputCls(!!errors.reconciliationDate)}
        />
        {errors.reconciliationDate && (
          <p className="mt-1 text-xs text-red-500">{errors.reconciliationDate.message}</p>
        )}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? '触发中...' : '触发对账'}
        </button>
      </div>
    </form>
  );
}
