import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import type { ServiceCategoryResponse } from '@/types/catalog';
import { cn } from '@/lib/utils';

const categorySchema = z.object({
  name: z.string().min(1, '请输入分类名称'),
  code: z.string().optional(),
  parentId: z.string().optional(),
  iconUrl: z.string().url('请输入有效链接').optional().or(z.literal('')),
  sortOrder: z.coerce.number().int('排序必须为整数').min(0, '排序不能为负数').optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Partial<CategoryFormValues>;
  categories?: ServiceCategoryResponse[];
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  loading?: boolean;
}

export default function CategoryForm({
  initialData,
  categories = [],
  onSubmit,
  loading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      code: '',
      parentId: '',
      iconUrl: '',
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
        <label htmlFor="cat-name" className="mb-1.5 block text-sm font-medium text-gray-700">
          分类名称 <span className="text-red-400">*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          {...register('name')}
          className={inputCls(!!errors.name)}
          placeholder="请输入分类名称"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Code */}
      <div>
        <label htmlFor="cat-code" className="mb-1.5 block text-sm font-medium text-gray-700">
          编码
        </label>
        <input
          id="cat-code"
          type="text"
          {...register('code')}
          className={inputCls(false)}
          placeholder="请输入编码"
        />
      </div>

      {/* Parent */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="cat-parent" className="mb-1.5 block text-sm font-medium text-gray-700">
            上级分类
          </label>
          <select
            id="cat-parent"
            {...register('parentId')}
            className={inputCls(false)}
          >
            <option value="">无（顶级分类）</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Icon URL */}
      <div>
        <label htmlFor="cat-icon" className="mb-1.5 block text-sm font-medium text-gray-700">
          图标链接
        </label>
        <input
          id="cat-icon"
          type="url"
          {...register('iconUrl')}
          className={inputCls(!!errors.iconUrl)}
          placeholder="https://..."
        />
        {errors.iconUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.iconUrl.message}</p>
        )}
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="cat-sort" className="mb-1.5 block text-sm font-medium text-gray-700">
          排序
        </label>
        <input
          id="cat-sort"
          type="number"
          min="0"
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
