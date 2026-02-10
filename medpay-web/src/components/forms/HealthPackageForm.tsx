import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { healthPackageSchema } from '@/lib/validators';
import type { HealthPackageFormValues } from '@/lib/validators';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import { PackageType } from '@/types/enums';
import { cn } from '@/lib/utils';

interface HealthPackageFormProps {
  initialData?: Partial<HealthPackageFormValues>;
  onSubmit: (data: HealthPackageFormValues) => Promise<void>;
  loading?: boolean;
}

export default function HealthPackageForm({
  initialData,
  onSubmit,
  loading = false,
}: HealthPackageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthPackageFormValues>({
    resolver: zodResolver(healthPackageSchema),
    defaultValues: {
      name: '',
      description: '',
      packageType: '',
      hospitalId: '',
      originalPrice: 0,
      discountPrice: 0,
      imageUrl: '',
      isActive: true,
      serviceIds: [],
      productIds: [],
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
        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="pkg-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            套餐名称 <span className="text-red-400">*</span>
          </label>
          <input
            id="pkg-name"
            type="text"
            {...register('name')}
            className={inputCls(!!errors.name)}
            placeholder="请输入套餐名称"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Package Type */}
        <div>
          <label htmlFor="pkg-type" className="mb-1.5 block text-sm font-medium text-gray-700">
            套餐类型 <span className="text-red-400">*</span>
          </label>
          <select
            id="pkg-type"
            {...register('packageType')}
            className={inputCls(!!errors.packageType)}
          >
            <option value="">请选择</option>
            {Object.values(PackageType).map((type) => (
              <option key={type} value={type}>
                {PACKAGE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.packageType && (
            <p className="mt-1 text-xs text-red-500">{errors.packageType.message}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label htmlFor="pkg-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            所属医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="pkg-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
          )}
        </div>

        {/* Original Price */}
        <div>
          <label htmlFor="pkg-original" className="mb-1.5 block text-sm font-medium text-gray-700">
            原价 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="pkg-original"
            type="number"
            step="0.01"
            min="0"
            {...register('originalPrice')}
            className={inputCls(!!errors.originalPrice)}
            placeholder="0.00"
          />
          {errors.originalPrice && (
            <p className="mt-1 text-xs text-red-500">{errors.originalPrice.message}</p>
          )}
        </div>

        {/* Discount Price */}
        <div>
          <label htmlFor="pkg-discount" className="mb-1.5 block text-sm font-medium text-gray-700">
            优惠价 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="pkg-discount"
            type="number"
            step="0.01"
            min="0"
            {...register('discountPrice')}
            className={inputCls(!!errors.discountPrice)}
            placeholder="0.00"
          />
          {errors.discountPrice && (
            <p className="mt-1 text-xs text-red-500">{errors.discountPrice.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="pkg-img" className="mb-1.5 block text-sm font-medium text-gray-700">
            图片链接
          </label>
          <input
            id="pkg-img"
            type="url"
            {...register('imageUrl')}
            className={inputCls(!!errors.imageUrl)}
            placeholder="https://..."
          />
          {errors.imageUrl && (
            <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="pkg-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="pkg-desc"
          rows={3}
          {...register('description')}
          className={cn(inputCls(false), 'resize-none')}
          placeholder="请输入套餐描述"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="pkg-active"
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-ivory-200 text-sage-500 focus:ring-sage-500/40"
        />
        <label htmlFor="pkg-active" className="text-sm text-gray-700">
          启用套餐
        </label>
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
