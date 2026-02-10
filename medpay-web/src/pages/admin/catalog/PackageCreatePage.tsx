import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PackageType } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { healthPackagesApi } from '@/api/health-packages.api';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function PackageCreatePage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    packageType: PackageType.HEALTH_CHECKUP as string,
    description: '',
    price: '',
    originalPrice: '',
    validityDays: '',
    maxUsage: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await healthPackagesApi.create({
        name: form.name,
        code: form.code,
        packageType: form.packageType as PackageType,
        description: form.description || undefined,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        validityDays: form.validityDays ? Number(form.validityDays) : undefined,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      });
      toast.success('Package created successfully');
      navigate('/admin/catalog/packages');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Add Health Package"
        breadcrumbs={[
          { label: 'Packages', href: '/admin/catalog/packages' },
          { label: 'Add Package' },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Package name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Code <span className="text-red-500">*</span>
            </label>
            <Input value={form.code} onChange={(e) => handleChange('code', e.target.value)} placeholder="PKG-001" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Package Type</label>
          <Select value={form.packageType} onChange={(e) => handleChange('packageType', e.target.value)}>
            {Object.entries(PACKAGE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (CNY) <span className="text-red-500">*</span>
            </label>
            <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Original Price (CNY)</label>
            <Input type="number" value={form.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)} step="0.01" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Validity (days)</label>
            <Input type="number" value={form.validityDays} onChange={(e) => handleChange('validityDays', e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Max Usage</label>
            <Input type="number" value={form.maxUsage} onChange={(e) => handleChange('maxUsage', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/packages')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Package</Button>
        </div>
      </form>
    </PageContainer>
  );
}
