import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductResponse } from '@/types/catalog';
import { ProductType } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { productsApi } from '@/api/products.api';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    productType: ProductType.MEDICINE as string,
    price: '',
    specification: '',
    manufacturer: '',
    status: 'ACTIVE',
  });

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
      setForm({
        name: data.name,
        productType: data.productType,
        price: String(data.price),
        specification: data.specification ?? '',
        manufacturer: data.manufacturer ?? '',
        status: data.status,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载商品失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.name.trim()) {
      toast.error('名称不能为空');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.update(id, {
        name: form.name,
        code: form.name.toUpperCase().replace(/\s+/g, '-'),
        productType: form.productType as ProductType,
        price: Number(form.price),
        specification: form.specification || undefined,
        manufacturer: form.manufacturer || undefined,
        requiresPrescription: false,
        insuranceCovered: false,
      });
      toast.success('商品已更新');
      navigate('/admin/catalog/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新商品失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? '商品未找到'}</p>
          <Button variant="outline" onClick={fetchProduct}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="编辑商品"
        breadcrumbs={[
          { label: '商品', href: '/admin/catalog/products' },
          { label: product.name },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">名称 *</label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
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
            <Input value={form.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">价格（元）</label>
          <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">规格</label>
          <Input value={form.specification} onChange={(e) => handleChange('specification', e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">状态</label>
          <p className="text-sm text-gray-700">{form.status === 'ACTIVE' ? '启用' : form.status === 'INACTIVE' ? '停用' : form.status}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/products')}>取消</Button>
          <Button type="submit" loading={submitting}>保存更改</Button>
        </div>
      </form>
    </PageContainer>
  );
}
