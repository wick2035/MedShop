import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { hospitalSchema } from '@/lib/validators';
import type { HospitalFormValues } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@/types/enums';

interface HospitalFormProps {
  initialData?: Partial<HospitalFormValues>;
  onSubmit: (data: HospitalFormValues) => Promise<void>;
  loading?: boolean;
}

export default function HospitalForm({
  initialData,
  onSubmit,
  loading = false,
}: HospitalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      description: '',
      logoUrl: '',
      subscriptionTier: SubscriptionTier.STANDARD,
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
      {/* Name */}
      <div>
        <label htmlFor="hospital-name" className="mb-1.5 block text-sm font-medium text-gray-700">
          医院名称 <span className="text-red-400">*</span>
        </label>
        <input
          id="hospital-name"
          type="text"
          {...register('name')}
          className={inputCls(!!errors.name)}
          placeholder="请输入医院名称"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="hospital-address" className="mb-1.5 block text-sm font-medium text-gray-700">
          地址 <span className="text-red-400">*</span>
        </label>
        <input
          id="hospital-address"
          type="text"
          {...register('address')}
          className={inputCls(!!errors.address)}
          placeholder="请输入医院地址"
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="hospital-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
          联系电话 <span className="text-red-400">*</span>
        </label>
        <input
          id="hospital-phone"
          type="tel"
          {...register('phone')}
          className={inputCls(!!errors.phone)}
          placeholder="请输入联系电话"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Subscription Tier */}
      <div>
        <label htmlFor="hospital-tier" className="mb-1.5 block text-sm font-medium text-gray-700">
          订阅等级 <span className="text-red-400">*</span>
        </label>
        <select
          id="hospital-tier"
          {...register('subscriptionTier')}
          className={inputCls(!!errors.subscriptionTier)}
        >
          <option value="">请选择</option>
          <option value={SubscriptionTier.STANDARD}>标准版</option>
          <option value={SubscriptionTier.PREMIUM}>高级版</option>
          <option value={SubscriptionTier.ENTERPRISE}>企业版</option>
        </select>
        {errors.subscriptionTier && (
          <p className="mt-1 text-xs text-red-500">{errors.subscriptionTier.message}</p>
        )}
      </div>

      {/* Logo URL */}
      <div>
        <label htmlFor="hospital-logo" className="mb-1.5 block text-sm font-medium text-gray-700">
          Logo 链接
        </label>
        <input
          id="hospital-logo"
          type="url"
          {...register('logoUrl')}
          className={inputCls(!!errors.logoUrl)}
          placeholder="https://..."
        />
        {errors.logoUrl && <p className="mt-1 text-xs text-red-500">{errors.logoUrl.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="hospital-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="hospital-desc"
          rows={3}
          {...register('description')}
          className={cn(inputCls(!!errors.description), 'resize-none')}
          placeholder="请输入医院描述"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
