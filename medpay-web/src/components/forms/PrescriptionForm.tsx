import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { prescriptionSchema } from '@/lib/validators';
import type { PrescriptionFormValues } from '@/lib/validators';
import type { ProductResponse } from '@/types/catalog';
import { cn } from '@/lib/utils';

interface PrescriptionFormProps {
  products?: ProductResponse[];
  patients?: { id: string; name: string }[];
  onSubmit: (data: PrescriptionFormValues) => Promise<void>;
  loading?: boolean;
}

export default function PrescriptionForm({
  products = [],
  patients = [],
  onSubmit,
  loading = false,
}: PrescriptionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      hospitalId: '',
      diagnosis: '',
      notes: '',
      items: [
        { productId: '', quantity: 1, dosage: '', frequency: '', duration: '', notes: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

  const medicines = products.filter((p) => p.productType === 'MEDICINE');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Patient + Doctor + Hospital */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="rx-patient" className="mb-1.5 block text-sm font-medium text-gray-700">
            患者 <span className="text-red-400">*</span>
          </label>
          {patients.length > 0 ? (
            <select
              id="rx-patient"
              {...register('patientId')}
              className={inputCls(!!errors.patientId)}
            >
              <option value="">请选择患者</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="rx-patient"
              type="text"
              {...register('patientId')}
              className={inputCls(!!errors.patientId)}
              placeholder="请输入患者 ID"
            />
          )}
          {errors.patientId && (
            <p className="mt-1 text-xs text-red-500">{errors.patientId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="rx-doctor" className="mb-1.5 block text-sm font-medium text-gray-700">
            医生 <span className="text-red-400">*</span>
          </label>
          <input
            id="rx-doctor"
            type="text"
            {...register('doctorId')}
            className={inputCls(!!errors.doctorId)}
            placeholder="请输入医生 ID"
          />
          {errors.doctorId && (
            <p className="mt-1 text-xs text-red-500">{errors.doctorId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="rx-hospital" className="mb-1.5 block text-sm font-medium text-gray-700">
            医院 <span className="text-red-400">*</span>
          </label>
          <input
            id="rx-hospital"
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

      {/* Diagnosis */}
      <div>
        <label htmlFor="rx-diagnosis" className="mb-1.5 block text-sm font-medium text-gray-700">
          诊断 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="rx-diagnosis"
          rows={2}
          {...register('diagnosis')}
          className={cn(inputCls(!!errors.diagnosis), 'resize-none')}
          placeholder="请输入诊断信息"
        />
        {errors.diagnosis && (
          <p className="mt-1 text-xs text-red-500">{errors.diagnosis.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="rx-notes" className="mb-1.5 block text-sm font-medium text-gray-700">
          备注
        </label>
        <textarea
          id="rx-notes"
          rows={2}
          {...register('notes')}
          className={cn(inputCls(false), 'resize-none')}
          placeholder="备注信息（可选）"
        />
      </div>

      {/* Items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            处方药品 <span className="text-red-400">*</span>
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                productId: '',
                quantity: 1,
                dosage: '',
                frequency: '',
                duration: '',
                notes: '',
              })
            }
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-3 py-1.5',
              'border border-sage-200 bg-sage-50 text-xs font-medium text-sage-600',
              'hover:bg-sage-100 transition-colors',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            添加药品
          </button>
        </div>

        {errors.items?.root && (
          <p className="mb-2 text-xs text-red-500">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-ivory-200/60 bg-ivory-50/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  药品 #{index + 1}
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
                {/* Product */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-gray-500">
                    药品 <span className="text-red-400">*</span>
                  </label>
                  {medicines.length > 0 ? (
                    <select
                      {...register(`items.${index}.productId`)}
                      className={inputCls(!!errors.items?.[index]?.productId)}
                    >
                      <option value="">请选择药品</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.specification})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      {...register(`items.${index}.productId`)}
                      className={inputCls(!!errors.items?.[index]?.productId)}
                      placeholder="药品 ID"
                    />
                  )}
                  {errors.items?.[index]?.productId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.items[index].productId?.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    数量 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`)}
                    className={inputCls(!!errors.items?.[index]?.quantity)}
                    placeholder="1"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.items[index].quantity?.message}
                    </p>
                  )}
                </div>

                {/* Dosage */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    用法用量 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register(`items.${index}.dosage`)}
                    className={inputCls(!!errors.items?.[index]?.dosage)}
                    placeholder="每次1片"
                  />
                  {errors.items?.[index]?.dosage && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.items[index].dosage?.message}
                    </p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    使用频率 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register(`items.${index}.frequency`)}
                    className={inputCls(!!errors.items?.[index]?.frequency)}
                    placeholder="每日3次"
                  />
                  {errors.items?.[index]?.frequency && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.items[index].frequency?.message}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">疗程</label>
                  <input
                    type="text"
                    {...register(`items.${index}.duration`)}
                    className={inputCls(false)}
                    placeholder="7天"
                  />
                </div>
              </div>
            </div>
          ))}
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
          {loading ? '保存中...' : '开具处方'}
        </button>
      </div>
    </form>
  );
}
