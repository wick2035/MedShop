import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { productSchema } from '@/lib/validators';
import type { ProductFormValues } from '@/lib/validators';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { ProductType } from '@/types/enums';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  loading?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      productType: '',
      hospitalId: '',
      price: 0,
      stock: 0,
      unit: '',
      manufacturer: '',
      approvalNumber: '',
      imageUrl: '',
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
          <label htmlFor="prod-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            商品名称 <span className="text-red-400">*</span>
          </label>
          <input
            id="prod-name"
            type="text"
            {...register('name')}
            className={inputCls(!!errors.name)}
            placeholder="请输入商品名称"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Product Type */}
        <div>
          <label htmlFor="prod-type" className="mb-1.5 block text-sm font-medium text-gray-700">
            商品类型 <span className="text-red-400">*</span>
          </label>
          <select
            id="prod-type"
            {...register('productType')}
            className={inputCls(!!errors.productType)}
          >
            <option value="">请选择</option>
            {Object.values(ProductType).map((type) => (
              <option key={type} value={type}>
                {PRODUCT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.productType && (
            <p className="mt-1 text-xs text-red-500">{errors.productType.message}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label htmlFor="prod-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            所属医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="prod-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="prod-price" className="mb-1.5 block text-sm font-medium text-gray-700">
            价格 (元) <span className="text-red-400">*</span>
          </label>
          <input
            id="prod-price"
            type="number"
            step="0.01"
            min="0"
            {...register('price')}
            className={inputCls(!!errors.price)}
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="prod-stock" className="mb-1.5 block text-sm font-medium text-gray-700">
            库存 <span className="text-red-400">*</span>
          </label>
          <input
            id="prod-stock"
            type="number"
            min="0"
            {...register('stock')}
            className={inputCls(!!errors.stock)}
            placeholder="0"
          />
          {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
        </div>

        {/* Unit */}
        <div>
          <label htmlFor="prod-unit" className="mb-1.5 block text-sm font-medium text-gray-700">
            单位 <span className="text-red-400">*</span>
          </label>
          <input
            id="prod-unit"
            type="text"
            {...register('unit')}
            className={inputCls(!!errors.unit)}
            placeholder="盒/瓶/支"
          />
          {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit.message}</p>}
        </div>

        {/* Manufacturer */}
        <div>
          <label htmlFor="prod-mfr" className="mb-1.5 block text-sm font-medium text-gray-700">
            厂商
          </label>
          <input
            id="prod-mfr"
            type="text"
            {...register('manufacturer')}
            className={inputCls(false)}
            placeholder="请输入厂商名称"
          />
        </div>

        {/* Approval Number */}
        <div>
          <label htmlFor="prod-approval" className="mb-1.5 block text-sm font-medium text-gray-700">
            批准文号
          </label>
          <input
            id="prod-approval"
            type="text"
            {...register('approvalNumber')}
            className={inputCls(false)}
            placeholder="国药准字..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="prod-img" className="mb-1.5 block text-sm font-medium text-gray-700">
            图片链接
          </label>
          <input
            id="prod-img"
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
        <label htmlFor="prod-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="prod-desc"
          rows={3}
          {...register('description')}
          className={cn(inputCls(false), 'resize-none')}
          placeholder="请输入商品描述"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="prod-active"
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-ivory-200 text-sage-500 focus:ring-sage-500/40"
        />
        <label htmlFor="prod-active" className="text-sm text-gray-700">
          启用商品
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
