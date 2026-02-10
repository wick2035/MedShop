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
      toast.error('Please fill in all required fields');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.create({
        hospitalId: selectedHospitalId,
        name: form.name,
        productType: form.productType as ProductType,
        description: form.description || undefined,
        price: Number(form.price),
        specification: form.specification || undefined,
        manufacturer: form.manufacturer || undefined,
        stockQuantity: Number(form.stockQuantity) || 0,
      });
      toast.success('Product created successfully');
      navigate('/admin/catalog/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Add Product"
        breadcrumbs={[
          { label: 'Products', href: '/admin/catalog/products' },
          { label: 'Add Product' },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Product name" />
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
            <Input value={form.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} placeholder="Manufacturer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (CNY) <span className="text-red-500">*</span>
            </label>
            <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Initial Stock</label>
            <Input type="number" value={form.stockQuantity} onChange={(e) => handleChange('stockQuantity', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Specification</label>
          <Input value={form.specification} onChange={(e) => handleChange('specification', e.target.value)} placeholder="e.g. 500mg x 30 tablets" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/products')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Product</Button>
        </div>
      </form>
    </PageContainer>
  );
}
