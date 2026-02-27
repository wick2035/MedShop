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
      toast.error('请填写所有字段');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('请先选择医院');
      return;
    }
    setSubmitting(true);
    try {
      await reconciliationApi.trigger({
        reconciliationDate: form.reconciliationDate,
        channel: form.channel,
        hospitalId: selectedHospitalId,
      });
      toast.success('对账已触发');
      navigate('/admin/reconciliation');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '触发对账失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="触发对账"
        breadcrumbs={[
          { label: '对账', href: '/admin/reconciliation' },
          { label: '触发' },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            对账日期 <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.reconciliationDate}
            onChange={(e) => handleChange('reconciliationDate', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            支付渠道 <span className="text-red-500">*</span>
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
            取消
          </Button>
          <Button type="submit" loading={submitting}>
            触发对账
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
