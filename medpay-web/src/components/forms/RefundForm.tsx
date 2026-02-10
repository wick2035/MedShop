import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface RefundFormProps {
  maxAmount: number;
  onSubmit: (data: RefundFormData) => Promise<void>;
  loading?: boolean;
}

const createRefundFormSchema = (maxAmount: number) =>
  z.object({
    refundType: z.enum(['FULL', 'PARTIAL'], {
      required_error: '请选择退款类型',
    }),
    refundAmount: z.coerce
      .number()
      .min(0.01, '退款金额必须大于0')
      .max(maxAmount, `退款金额不能超过 ${maxAmount}`),
    refundReason: z.string().min(1, '请输入退款原因'),
  });

type RefundFormData = z.infer<ReturnType<typeof createRefundFormSchema>>;

export default function RefundForm({
  maxAmount,
  onSubmit,
  loading = false,
}: RefundFormProps) {
  const schema = createRefundFormSchema(maxAmount);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RefundFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      refundType: 'FULL',
      refundAmount: maxAmount,
      refundReason: '',
    },
  });

  const watchRefundType = watch('refundType');

  const handleTypeChange = (type: 'FULL' | 'PARTIAL') => {
    setValue('refundType', type);
    if (type === 'FULL') {
      setValue('refundAmount', maxAmount);
    }
  };

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Max Amount display */}
      <div className="rounded-md bg-ivory-50 border border-ivory-200 px-4 py-3">
        <p className="text-sm text-gray-500">
          可退款金额：
          <span className="font-semibold text-gray-900 font-display">
            {formatCurrency(maxAmount)}
          </span>
        </p>
      </div>

      {/* Refund Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          退款类型 <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('FULL')}
            className={cn(
              'flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
              watchRefundType === 'FULL'
                ? 'border-sage-400 bg-sage-50 text-sage-700'
                : 'border-ivory-200 bg-white text-gray-600 hover:border-sage-200',
            )}
          >
            全额退款
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('PARTIAL')}
            className={cn(
              'flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors',
              watchRefundType === 'PARTIAL'
                ? 'border-sage-400 bg-sage-50 text-sage-700'
                : 'border-ivory-200 bg-white text-gray-600 hover:border-sage-200',
            )}
          >
            部分退款
          </button>
        </div>
        <input type="hidden" {...register('refundType')} />
        {errors.refundType && (
          <p className="mt-1 text-xs text-red-500">{errors.refundType.message}</p>
        )}
      </div>

      {/* Refund Amount */}
      <div>
        <label htmlFor="refund-amount" className="mb-1.5 block text-sm font-medium text-gray-700">
          退款金额 (元) <span className="text-red-400">*</span>
        </label>
        <input
          id="refund-amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount}
          {...register('refundAmount')}
          className={inputCls(!!errors.refundAmount)}
          disabled={watchRefundType === 'FULL'}
          placeholder="0.00"
        />
        {errors.refundAmount && (
          <p className="mt-1 text-xs text-red-500">{errors.refundAmount.message}</p>
        )}
      </div>

      {/* Refund Reason */}
      <div>
        <label htmlFor="refund-reason" className="mb-1.5 block text-sm font-medium text-gray-700">
          退款原因 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="refund-reason"
          rows={3}
          {...register('refundReason')}
          className={cn(inputCls(!!errors.refundReason), 'resize-none')}
          placeholder="请详细说明退款原因"
        />
        {errors.refundReason && (
          <p className="mt-1 text-xs text-red-500">{errors.refundReason.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-5 py-2.5',
            'bg-terracotta text-white text-sm font-medium',
            'hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:ring-offset-2',
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? '提交中...' : '申请退款'}
        </button>
      </div>
    </form>
  );
}
