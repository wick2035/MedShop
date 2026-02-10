import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { ORDER_TYPE_LABELS } from '@/lib/constants';
import { OrderType, ItemType } from '@/types/enums';
import type { MedicalServiceResponse, ProductResponse } from '@/types/catalog';
import type { DoctorScheduleResponse } from '@/types/schedule';
import { cn } from '@/lib/utils';

const orderFormSchema = z.object({
  orderType: z.string().min(1, '请选择订单类型'),
  hospitalId: z.string().min(1, '请选择医院'),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        itemType: z.string().min(1, '请选择项目类型'),
        referenceId: z.string().min(1, '请选择项目'),
        quantity: z.coerce.number().int().min(1, '数量至少为1'),
      }),
    )
    .min(1, '至少需要一个订单项'),
  scheduleId: z.string().optional(),
  appointmentDate: z.string().optional(),
  deliveryType: z.string().optional(),
  deliveryAddress: z.string().optional(),
  remark: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  services?: MedicalServiceResponse[];
  products?: ProductResponse[];
  schedules?: DoctorScheduleResponse[];
  onSubmit: (data: OrderFormValues) => Promise<void>;
  loading?: boolean;
}

export default function OrderForm({
  services = [],
  products = [],
  schedules = [],
  onSubmit,
  loading = false,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: '',
      hospitalId: '',
      notes: '',
      couponCode: '',
      items: [{ itemType: '', referenceId: '', quantity: 1 }],
      scheduleId: '',
      appointmentDate: '',
      deliveryType: '',
      deliveryAddress: '',
      remark: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchOrderType = watch('orderType');
  const isAppointment =
    watchOrderType === OrderType.REGISTRATION ||
    watchOrderType === OrderType.EXAMINATION;

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Order Type */}
        <div>
          <label htmlFor="order-type" className="mb-1.5 block text-sm font-medium text-gray-700">
            订单类型 <span className="text-red-400">*</span>
          </label>
          <select
            id="order-type"
            {...register('orderType')}
            className={inputCls(!!errors.orderType)}
          >
            <option value="">请选择</option>
            {Object.values(OrderType).map((type) => (
              <option key={type} value={type}>
                {ORDER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.orderType && (
            <p className="mt-1 text-xs text-red-500">{errors.orderType.message}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label htmlFor="order-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="order-hospital"
            type="text"
            {...register('hospitalId')}
            className={inputCls(!!errors.hospitalId)}
            placeholder="请输入医院 ID"
          />
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            订单项 <span className="text-red-400">*</span>
          </h3>
          <button
            type="button"
            onClick={() => append({ itemType: '', referenceId: '', quantity: 1 })}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-3 py-1.5',
              'border border-sage-200 bg-sage-50 text-xs font-medium text-sage-600',
              'hover:bg-sage-100 transition-colors',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            添加项目
          </button>
        </div>

        {errors.items?.root && (
          <p className="mb-2 text-xs text-red-500">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const watchItemType = watch(`items.${index}.itemType`);
            return (
              <div
                key={field.id}
                className="rounded-lg border border-ivory-200/60 bg-ivory-50/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    项目 #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Item Type */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">类型</label>
                    <select
                      {...register(`items.${index}.itemType`)}
                      className={inputCls(!!errors.items?.[index]?.itemType)}
                    >
                      <option value="">请选择</option>
                      <option value={ItemType.SERVICE}>服务</option>
                      <option value={ItemType.PRODUCT}>商品</option>
                    </select>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">项目</label>
                    {watchItemType === ItemType.SERVICE && services.length > 0 ? (
                      <select
                        {...register(`items.${index}.referenceId`)}
                        className={inputCls(!!errors.items?.[index]?.referenceId)}
                      >
                        <option value="">请选择服务</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : watchItemType === ItemType.PRODUCT && products.length > 0 ? (
                      <select
                        {...register(`items.${index}.referenceId`)}
                        className={inputCls(!!errors.items?.[index]?.referenceId)}
                      >
                        <option value="">请选择商品</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        {...register(`items.${index}.referenceId`)}
                        className={inputCls(!!errors.items?.[index]?.referenceId)}
                        placeholder="项目 ID"
                      />
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">数量</label>
                    <input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`)}
                      className={inputCls(!!errors.items?.[index]?.quantity)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Info */}
      {isAppointment && (
        <div className="rounded-lg border border-sage-100 bg-sage-50/30 p-4">
          <h3 className="mb-3 text-sm font-semibold text-sage-700">预约信息</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">排班</label>
              {schedules.length > 0 ? (
                <select
                  {...register('scheduleId')}
                  className={inputCls(false)}
                >
                  <option value="">请选择排班</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.doctorName} - {s.date} {s.startTime}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  {...register('scheduleId')}
                  className={inputCls(false)}
                  placeholder="排班 ID"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">预约日期</label>
              <input
                type="date"
                {...register('appointmentDate')}
                className={inputCls(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery Info */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="order-delivery" className="mb-1.5 block text-sm font-medium text-gray-700">
            配送方式
          </label>
          <select
            id="order-delivery"
            {...register('deliveryType')}
            className={inputCls(false)}
          >
            <option value="">无需配送</option>
            <option value="SELF_PICKUP">自取</option>
            <option value="DELIVERY">配送</option>
          </select>
        </div>
        <div>
          <label htmlFor="order-address" className="mb-1.5 block text-sm font-medium text-gray-700">
            配送地址
          </label>
          <input
            id="order-address"
            type="text"
            {...register('deliveryAddress')}
            className={inputCls(false)}
            placeholder="请输入配送地址"
          />
        </div>
      </div>

      {/* Coupon + Remark */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="order-coupon" className="mb-1.5 block text-sm font-medium text-gray-700">
            优惠券代码
          </label>
          <input
            id="order-coupon"
            type="text"
            {...register('couponCode')}
            className={inputCls(false)}
            placeholder="请输入优惠券代码"
          />
        </div>
        <div>
          <label htmlFor="order-remark" className="mb-1.5 block text-sm font-medium text-gray-700">
            备注
          </label>
          <input
            id="order-remark"
            type="text"
            {...register('remark')}
            className={inputCls(false)}
            placeholder="备注信息"
          />
        </div>
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
          {loading ? '提交中...' : '创建订单'}
        </button>
      </div>
    </form>
  );
}
