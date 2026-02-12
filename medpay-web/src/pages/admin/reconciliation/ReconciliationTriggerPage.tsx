import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PaymentChannel } from '@/types/enums';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { reconciliationApi } from '@/api/reconciliation.api';
import { PAYMENT_CHANNEL_LABELS } from '@/lib/constants';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function ReconciliationTriggerPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    reconciliationDate: new Date().toISOString().split('T')[0],
    channel: PaymentChannel.WECHAT as string,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reconciliationDate || !form.channel) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    setSubmitting(true);
    try {
      await reconciliationApi.trigger({
        reconciliationDate: form.reconciliationDate,
        channel: form.channel,
        hospitalId: selectedHospitalId,
      });
      toast.success('Reconciliation triggered successfully');
      navigate('/admin/reconciliation');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to trigger reconciliation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Trigger Reconciliation"
        breadcrumbs={[
          { label: 'Reconciliation', href: '/admin/reconciliation' },
          { label: 'Trigger' },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Reconciliation Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.reconciliationDate}
            onChange={(e) => handleChange('reconciliationDate', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Payment Channel <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.channel}
            onChange={(e) => handleChange('channel', e.target.value)}
            options={Object.entries(PAYMENT_CHANNEL_LABELS).map(([key, label]) => ({
              value: key,
              label: label,
            }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/reconciliation')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Trigger Reconciliation
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
