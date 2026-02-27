import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { HealthPackageResponse } from '@/types/health-package';
import { PackageType } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { healthPackagesApi } from '@/api/health-packages.api';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';

export default function PackageEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<HealthPackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchPackage = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await healthPackagesApi.getById(id);
      setPkg(data);
      setForm({
        name: data.name,
        code: data.code,
        packageType: data.packageType,
        description: data.description ?? '',
        price: String(data.price),
        originalPrice: data.originalPrice ? String(data.originalPrice) : '',
        validityDays: data.validityDays ? String(data.validityDays) : '',
        maxUsage: data.maxUsage ? String(data.maxUsage) : '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载套餐失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
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
      await healthPackagesApi.update(id, {
        name: form.name,
        code: form.code,
        packageType: form.packageType as PackageType,
        description: form.description || undefined,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        validityDays: form.validityDays ? Number(form.validityDays) : undefined,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      });
      toast.success('套餐已更新');
      navigate('/admin/catalog/packages');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新套餐失败');
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

  if (error || !pkg) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? '套餐未找到'}</p>
          <Button variant="outline" onClick={fetchPackage}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="编辑健康套餐"
        breadcrumbs={[
          { label: '套餐', href: '/admin/catalog/packages' },
          { label: pkg.name },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">名称 *</label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">编码</label>
            <Input value={form.code} onChange={(e) => handleChange('code', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">套餐类型</label>
          <Select
            value={form.packageType}
            onChange={(e) => handleChange('packageType', e.target.value)}
            options={Object.entries(PACKAGE_TYPE_LABELS).map(([key, label]) => ({
              value: key,
              label: label,
            }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">价格（元）</label>
            <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} step="0.01" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">原价</label>
            <Input type="number" value={form.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)} step="0.01" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">有效期（天）</label>
            <Input type="number" value={form.validityDays} onChange={(e) => handleChange('validityDays', e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">最大使用次数</label>
            <Input type="number" value={form.maxUsage} onChange={(e) => handleChange('maxUsage', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">描述</label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/packages')}>取消</Button>
          <Button type="submit" loading={submitting}>保存更改</Button>
        </div>
      </form>
    </PageContainer>
  );
}
