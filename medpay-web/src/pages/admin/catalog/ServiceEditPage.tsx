import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { MedicalServiceResponse, ServiceCategoryResponse } from '@/types/catalog';
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

export default function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<MedicalServiceResponse | null>(null);
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serviceType: ServiceType.REGISTRATION as string,
    description: '',
    price: '',
    durationMinutes: '',
    requiresAppointment: false,
    enabled: true,
  });

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [svc, cats] = await Promise.all([
        medicalServicesApi.getById(id),
        catalogCategoriesApi.list(),
      ]);
      setService(svc);
      setCategories(cats);
      setForm({
        name: svc.name,
        categoryId: svc.categoryId,
        serviceType: svc.serviceType,
        description: svc.description ?? '',
        price: String(svc.price),
        durationMinutes: String(svc.durationMinutes ?? ''),
        requiresAppointment: svc.requiresAppointment,
        enabled: svc.enabled,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load service';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      await medicalServicesApi.update(id, {
        categoryId: form.categoryId || undefined,
        name: form.name,
        serviceType: form.serviceType as ServiceType,
        description: form.description || undefined,
        price: Number(form.price),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        requiresAppointment: form.requiresAppointment,
        enabled: form.enabled,
      });
      toast.success('Service updated');
      navigate('/admin/catalog/services');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update service');
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

  if (error || !service) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? 'Service not found'}</p>
          <Button variant="outline" onClick={fetchData}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Edit Medical Service"
        breadcrumbs={[
          { label: 'Services', href: '/admin/catalog/services' },
          { label: service.name },
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (CNY)</label>
            <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration (min)</label>
            <Input type="number" value={form.durationMinutes} onChange={(e) => handleChange('durationMinutes', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresAppointment"
              checked={form.requiresAppointment}
              onChange={(e) => handleChange('requiresAppointment', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
            />
            <label htmlFor="requiresAppointment" className="text-sm text-gray-700">Requires appointment</label>
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
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/services')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </PageContainer>
  );
}
