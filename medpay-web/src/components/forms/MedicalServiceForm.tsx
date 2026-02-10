import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { medicalServiceSchema } from '@/lib/validators';
import type { MedicalServiceFormValues } from '@/lib/validators';
import type { ServiceCategoryResponse } from '@/types/catalog';
import type { DepartmentResponse } from '@/types/department';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { ServiceType } from '@/types/enums';
import { cn } from '@/lib/utils';

interface MedicalServiceFormProps {
  initialData?: Partial<MedicalServiceFormValues>;
  categories?: ServiceCategoryResponse[];
  departments?: DepartmentResponse[];
  onSubmit: (data: MedicalServiceFormValues) => Promise<void>;
  loading?: boolean;
}

export default function MedicalServiceForm({
  initialData,
  categories = [],
  departments = [],
  onSubmit,
  loading = false,
}: MedicalServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicalServiceFormValues>({
    resolver: zodResolver(medicalServiceSchema),
    defaultValues: {
      name: '',
      description: '',
      serviceType: '',
      hospitalId: '',
      departmentId: '',
      price: 0,
      durationMinutes: undefined,
      isActive: true,
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
          <label htmlFor="svc-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            服务名称 <span className="text-red-400">*</span>
          </label>
          <input
            id="svc-name"
            type="text"
            {...register('name')}
            className={inputCls(!!errors.name)}
            placeholder="请输入服务名称"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Service Type */}
        <div>
          <label htmlFor="svc-type" className="mb-1.5 block text-sm font-medium text-gray-700">
            服务类型 <span className="text-red-400">*</span>
          </label>
          <select
            id="svc-type"
            {...register('serviceType')}
            className={inputCls(!!errors.serviceType)}
          >
            <option value="">请选择</option>
            {Object.values(ServiceType).map((type) => (
              <option key={type} value={type}>
                {SERVICE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.serviceType && (
            <p className="mt-1 text-xs text-red-500">{errors.serviceType.message}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label htmlFor="svc-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            所属医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="svc-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
          )}
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div>
            <label htmlFor="svc-category" className="mb-1.5 block text-sm font-medium text-gray-700">
              分类
            </label>
            <select id="svc-category" className={inputCls(false)} disabled>
              <option value="">请选择</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department */}
        {departments.length > 0 && (
          <div>
            <label htmlFor="svc-dept" className="mb-1.5 block text-sm font-medium text-gray-700">
              科室
            </label>
            <select
              id="svc-dept"
              {...register('departmentId')}
              className={inputCls(false)}
            >
              <option value="">请选择</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price */}
        <div>
          <label htmlFor="svc-price" className="mb-1.5 block text-sm font-medium text-gray-700">
            价格 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="svc-price"
            type="number"
            step="0.01"
            min="0"
            {...register('price')}
            className={inputCls(!!errors.price)}
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="svc-duration" className="mb-1.5 block text-sm font-medium text-gray-700">
            时长 (分钟)
          </label>
          <input
            id="svc-duration"
            type="number"
            min="1"
            {...register('durationMinutes')}
            className={inputCls(!!errors.durationMinutes)}
            placeholder="30"
          />
          {errors.durationMinutes && (
            <p className="mt-1 text-xs text-red-500">{errors.durationMinutes.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="svc-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="svc-desc"
          rows={3}
          {...register('description')}
          className={cn(inputCls(false), 'resize-none')}
          placeholder="请输入服务描述"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="svc-active"
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-ivory-200 text-sage-500 focus:ring-sage-500/40"
        />
        <label htmlFor="svc-active" className="text-sm text-gray-700">
          启用服务
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
