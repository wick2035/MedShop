import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { ServiceCategoryResponse } from '@/types/catalog';
import { ServiceType } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { medicalServicesApi } from '@/api/medical-services.api';
import { catalogCategoriesApi } from '@/api/catalog-categories.api';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function ServiceCreatePage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serviceType: ServiceType.REGISTRATION as string,
    description: '',
    price: '',
    durationMinutes: '',
    requiresAppointment: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await catalogCategoriesApi.list();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    setSubmitting(true);
    try {
      await medicalServicesApi.create({
        hospitalId: selectedHospitalId,
        categoryId: form.categoryId,
        name: form.name,
        serviceType: form.serviceType as ServiceType,
        description: form.description || undefined,
        price: Number(form.price),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        requiresAppointment: form.requiresAppointment,
      });
      toast.success('Service created successfully');
      navigate('/admin/catalog/services');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create service');
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

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Add Medical Service"
        breadcrumbs={[
          { label: 'Services', href: '/admin/catalog/services' },
          { label: 'Add Service' },
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
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Service name" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <Select value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Service Type</label>
            <Select value={form.serviceType} onChange={(e) => handleChange('serviceType', e.target.value)}>
              {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (CNY) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration (min)</label>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', e.target.value)}
              placeholder="30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requiresAppointment"
            checked={form.requiresAppointment}
            onChange={(e) => handleChange('requiresAppointment', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
          />
          <label htmlFor="requiresAppointment" className="text-sm text-gray-700">
            Requires appointment
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/services')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Service
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
