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
      setLoading(true);
      try {
        const data = await catalogCategoriesApi.list(selectedHospitalId ?? undefined);
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载分类失败');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedHospitalId]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.price) {
      toast.error('请填写所有必填项');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('请先选择医院');
      return;
    }
    setSubmitting(true);
    try {
      await medicalServicesApi.create({
        categoryId: form.categoryId,
        name: form.name,
        code: form.name.toUpperCase().replace(/\s+/g, '-'),
        serviceType: form.serviceType as ServiceType,
        description: form.description || undefined,
        price: Number(form.price),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        requiresPrescription: false,
        insuranceCovered: false,
      });
      toast.success('服务创建成功');
      navigate('/admin/catalog/services');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建服务失败');
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
        title="添加医疗服务"
        breadcrumbs={[
          { label: '服务', href: '/admin/catalog/services' },
          { label: '添加服务' },
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
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="服务名称" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              分类 <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              options={[
                { value: '', label: '请选择分类' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">服务类型</label>
            <Select
              value={form.serviceType}
              onChange={(e) => handleChange('serviceType', e.target.value)}
              options={Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label: label,
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              价格（元） <span className="text-red-500">*</span>
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">时长（分钟）</label>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', e.target.value)}
              placeholder="30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">描述</label>
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
            需要预约
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/services')}>
            取消
          </Button>
          <Button type="submit" loading={submitting}>
            创建服务
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
