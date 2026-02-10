import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const splitPaySchema = z.object({
  orderId: z.string().min(1, '请输入订单 ID'),
  insuranceAmount: z.coerce.number().min(0, '医保金额不能为负数'),
  selfPayAmount: z.coerce.number().min(0, '自付金额不能为负数'),
});

type SplitPayFormValues = z.infer<typeof splitPaySchema>;

interface SplitPayFormProps {
  onSubmit: (data: SplitPayFormValues) => Promise<void>;
  loading?: boolean;
  totalAmount?: number;
}

export default function SplitPayForm({
  onSubmit,
  loading = false,
  totalAmount,
}: SplitPayFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SplitPayFormValues>({
    resolver: zodResolver(splitPaySchema),
    defaultValues: {
      orderId: '',
      insuranceAmount: 0,
      selfPayAmount: 0,
    },
  });

  const watchInsurance = watch('insuranceAmount') || 0;
  const watchSelf = watch('selfPayAmount') || 0;
  const computedTotal = Number(watchInsurance) + Number(watchSelf);

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Total display */}
      {totalAmount !== undefined && (
        <div className="rounded-md bg-ivory-50 border border-ivory-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            订单总额：
            <span className="font-semibold text-gray-900 font-display">
              {formatCurrency(totalAmount)}
            </span>
          </p>
        </div>
      )}

      {/* Order ID */}
      <div>
        <label htmlFor="split-order" className="mb-1.5 block text-sm font-medium text-gray-700">
          订单 ID <span className="text-red-400">*</span>
        </label>
        <input
          id="split-order"
          type="text"
          {...register('orderId')}
          className={inputCls(!!errors.orderId)}
          placeholder="请输入订单 ID"
        />
        {errors.orderId && (
          <p className="mt-1 text-xs text-red-500">{errors.orderId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Insurance Amount */}
        <div>
          <label htmlFor="split-insurance" className="mb-1.5 block text-sm font-medium text-gray-700">
            医保支付 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="split-insurance"
            type="number"
            step="0.01"
            min="0"
            {...register('insuranceAmount')}
            className={inputCls(!!errors.insuranceAmount)}
            placeholder="0.00"
          />
          {errors.insuranceAmount && (
            <p className="mt-1 text-xs text-red-500">{errors.insuranceAmount.message}</p>
          )}
        </div>

        {/* Self-Pay Amount */}
        <div>
          <label htmlFor="split-self" className="mb-1.5 block text-sm font-medium text-gray-700">
            自付金额 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="split-self"
            type="number"
            step="0.01"
            min="0"
            {...register('selfPayAmount')}
            className={inputCls(!!errors.selfPayAmount)}
            placeholder="0.00"
          />
          {errors.selfPayAmount && (
            <p className="mt-1 text-xs text-red-500">{errors.selfPayAmount.message}</p>
          )}
        </div>
      </div>

      {/* Computed total */}
      <div className="flex items-center justify-between rounded-md bg-sage-50/50 border border-sage-100 px-4 py-2.5">
        <span className="text-sm text-gray-600">拆分合计</span>
        <span
          className={cn(
            'text-sm font-semibold font-display',
            totalAmount !== undefined && Math.abs(computedTotal - totalAmount) > 0.01
              ? 'text-red-500'
              : 'text-sage-600',
          )}
        >
          {formatCurrency(computedTotal)}
        </span>
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
            <CreditCard className="h-4 w-4" />
          )}
          {loading ? '提交中...' : '确认拆分支付'}
        </button>
      </div>
    </form>
  );
}
