import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { departmentSchema } from '@/lib/validators';
import type { DepartmentFormValues } from '@/lib/validators';
import type { DepartmentResponse } from '@/types/department';
import { cn } from '@/lib/utils';

interface DepartmentFormProps {
  initialData?: Partial<DepartmentFormValues>;
  departments?: DepartmentResponse[];
  onSubmit: (data: DepartmentFormValues) => Promise<void>;
  loading?: boolean;
}

export default function DepartmentForm({
  initialData,
  departments = [],
  onSubmit,
  loading = false,
}: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: '',
      hospitalId: '',
      sortOrder: 0,
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
        <label htmlFor="dept-name" className="mb-1.5 block text-sm font-medium text-gray-700">
          科室名称 <span className="text-red-400">*</span>
        </label>
        <input
          id="dept-name"
          type="text"
          {...register('name')}
          className={inputCls(!!errors.name)}
          placeholder="请输入科室名称"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Hospital ID (hidden or select based on context) */}
      <div>
        <label htmlFor="dept-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
          所属医院 <span className="text-red-400">*</span>
        </label>
        <input
          id="dept-hospital"
          type="text"
          {...register('hospitalId')}
          className={inputCls(!!errors.hospitalId)}
          placeholder="请输入医院 ID"
        />
        {errors.hospitalId && (
          <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
        )}
      </div>

      {/* Parent department (informational, as DepartmentResponse doesn't have parentId) */}
      {departments.length > 0 && (
        <div>
          <label htmlFor="dept-parent" className="mb-1.5 block text-sm font-medium text-gray-700">
            参考科室
          </label>
          <select
            id="dept-parent"
            className={inputCls(false)}
            disabled
          >
            <option value="">无（顶级科室）</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">科室层级仅供参考</p>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="dept-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="dept-desc"
          rows={3}
          {...register('description')}
          className={cn(inputCls(!!errors.description), 'resize-none')}
          placeholder="请输入科室描述"
        />
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="dept-sort" className="mb-1.5 block text-sm font-medium text-gray-700">
          排序
        </label>
        <input
          id="dept-sort"
          type="number"
          min={0}
          {...register('sortOrder')}
          className={inputCls(!!errors.sortOrder)}
          placeholder="0"
        />
        {errors.sortOrder && (
          <p className="mt-1 text-xs text-red-500">{errors.sortOrder.message}</p>
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
