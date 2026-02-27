import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ProductType } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { productsApi } from '@/api/products.api';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    productType: ProductType.MEDICINE as string,
    description: '',
    price: '',
    specification: '',
    manufacturer: '',
    stockQuantity: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error('请填写所有必填项');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('请先选择医院');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.create({
        name: form.name,
        code: form.name.toUpperCase().replace(/\s+/g, '-'),
        productType: form.productType as ProductType,
        price: Number(form.price),
        specification: form.specification || undefined,
        manufacturer: form.manufacturer || undefined,
        stockQuantity: Number(form.stockQuantity) || 0,
        requiresPrescription: false,
        insuranceCovered: false,
      });
      toast.success('商品创建成功');
      navigate('/admin/catalog/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建商品失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="添加商品"
        breadcrumbs={[
          { label: '商品', href: '/admin/catalog/products' },
          { label: '添加商品' },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            名称 <span className="text-red-500">*</span>
          </label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="商品名称" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">商品类型</label>
            <Select
              value={form.productType}
              onChange={(e) => handleChange('productType', e.target.value)}
              options={Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label: label,
              }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">生产厂商</label>
            <Input value={form.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} placeholder="生产厂商" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              价格（元） <span className="text-red-500">*</span>
            </label>
            <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">初始库存</label>
            <Input type="number" value={form.stockQuantity} onChange={(e) => handleChange('stockQuantity', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">规格</label>
          <Input value={form.specification} onChange={(e) => handleChange('specification', e.target.value)} placeholder="如：500mg x 30片" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">描述</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/products')}>取消</Button>
          <Button type="submit" loading={submitting}>创建商品</Button>
        </div>
      </form>
    </PageContainer>
  );
}
