import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const insuranceCalcSchema = z.object({
  orderId: z.string().min(1, '请输入订单 ID'),
});

type InsuranceCalcFormValues = z.infer<typeof insuranceCalcSchema>;

interface InsuranceCalculateFormProps {
  onSubmit: (data: InsuranceCalcFormValues) => Promise<void>;
  loading?: boolean;
}

export default function InsuranceCalculateForm({
  onSubmit,
  loading = false,
}: InsuranceCalculateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsuranceCalcFormValues>({
    resolver: zodResolver(insuranceCalcSchema),
    defaultValues: { orderId: '' },
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
      <div>
        <label htmlFor="ins-order" className="mb-1.5 block text-sm font-medium text-gray-700">
          订单 ID <span className="text-red-400">*</span>
        </label>
        <input
          id="ins-order"
          type="text"
          {...register('orderId')}
          className={inputCls(!!errors.orderId)}
          placeholder="请输入订单 ID"
        />
        {errors.orderId && (
          <p className="mt-1 text-xs text-red-500">{errors.orderId.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-5 py-2.5',
          'bg-sky text-white text-sm font-medium',
          'hover:bg-sky/90 active:bg-sky/80 transition-colors',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-sky/40 focus:ring-offset-2',
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Calculator className="h-4 w-4" />
        )}
        {loading ? '计算中...' : '计算医保'}
      </button>
    </form>
  );
}
