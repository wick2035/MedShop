import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { HospitalResponse } from '@/types/hospital';
import { SubscriptionTier } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { hospitalsApi } from '@/api/hospitals.api';

export default function HospitalEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState<HospitalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    level: '',
    subscriptionTier: SubscriptionTier.STANDARD as string,
    description: '',
  });

  const fetchHospital = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await hospitalsApi.getById(id);
      setHospital(data);
      setForm({
        name: data.name,
        address: data.address,
        phone: data.contactPhone ?? '',
        email: data.contactEmail ?? '',
        level: '',
        subscriptionTier: data.subscriptionTier,
        description: '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载医院失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      toast.error('请填写所有必填项');
      return;
    }
    setSubmitting(true);
    try {
      await hospitalsApi.update(id, {
        name: form.name,
        address: form.address || undefined,
        contactPhone: form.phone || undefined,
        contactEmail: form.email || undefined,
      });
      toast.success('医院更新成功');
      navigate(`/admin/hospitals/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新医院失败');
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

  if (error || !hospital) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? '未找到医院'}</p>
          <Button variant="outline" onClick={fetchHospital}>
            重试
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="编辑医院"
        breadcrumbs={[
          { label: '医院', href: '/admin/hospitals' },
          { label: hospital.name, href: `/admin/hospitals/${id}` },
          { label: '编辑' },
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
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="医院名称"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            地址 <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="详细地址"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              电话 <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="联系电话"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">邮箱</label>
            <Input
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="联系邮箱"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">等级</label>
            <Input
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              placeholder="如 三甲"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              订阅套餐
            </label>
            <Select
              value={form.subscriptionTier}
              onChange={(e) => handleChange('subscriptionTier', e.target.value)}
              options={Object.values(SubscriptionTier).map((tier) => ({
                value: tier,
                label: tier,
              }))}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">描述</label>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="医院简介"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/admin/hospitals/${id}`)}>
            取消
          </Button>
          <Button type="submit" loading={submitting}>
            保存修改
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
