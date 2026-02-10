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
    description: '',
    price: '',
    specification: '',
    manufacturer: '',
    enabled: true,
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
        description: data.description ?? '',
        price: String(data.price),
        specification: data.specification ?? '',
        manufacturer: data.manufacturer ?? '',
        enabled: data.enabled,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load product';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.update(id, {
        name: form.name,
        productType: form.productType as ProductType,
        description: form.description || undefined,
        price: Number(form.price),
        specification: form.specification || undefined,
        manufacturer: form.manufacturer || undefined,
        enabled: form.enabled,
      });
      toast.success('Product updated');
      navigate('/admin/catalog/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product');
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
          <p>{error ?? 'Product not found'}</p>
          <Button variant="outline" onClick={fetchProduct}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Product"
        breadcrumbs={[
          { label: 'Products', href: '/admin/catalog/products' },
          { label: product.name },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Name *</label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Product Type</label>
            <Select value={form.productType} onChange={(e) => handleChange('productType', e.target.value)}>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Manufacturer</label>
            <Input value={form.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (CNY)</label>
          <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Specification</label>
          <Input value={form.specification} onChange={(e) => handleChange('specification', e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enabled"
            checked={form.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
          />
          <label htmlFor="enabled" className="text-sm text-gray-700">Enabled</label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/products')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </PageContainer>
  );
}
