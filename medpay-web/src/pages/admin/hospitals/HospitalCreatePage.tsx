import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

import { hospitalsApi } from '@/api/hospitals.api';
import { SubscriptionTier } from '@/types/enums';

export default function HospitalCreatePage() {
  const navigate = useNavigate();
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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await hospitalsApi.create({
        name: form.name,
        code: form.name.toUpperCase().replace(/\s+/g, '-'),
        address: form.address || undefined,
        contactPhone: form.phone || undefined,
        contactEmail: form.email || undefined,
      });
      toast.success('Hospital created successfully');
      navigate('/admin/hospitals');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create hospital');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Add Hospital"
        breadcrumbs={[
          { label: 'Hospitals', href: '/admin/hospitals' },
          { label: 'Add Hospital' },
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
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Hospital name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Full address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Contact phone"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <Input
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Contact email"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Level</label>
            <Input
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              placeholder="e.g. Level 3A"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Subscription Tier
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
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the hospital"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/hospitals')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Hospital
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
