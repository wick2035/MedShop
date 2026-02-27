import { useState } from 'react';
import { Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { reportsApi } from '@/api/reports.api';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

type DataType = 'revenue' | 'orders' | 'payments' | 'refunds' | 'settlements';

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: 'revenue', label: '营收报表' },
  { value: 'orders', label: '订单报表' },
  { value: 'payments', label: '支付报表' },
  { value: 'refunds', label: '退款报表' },
  { value: 'settlements', label: '结算报表' },
];

export default function ExportPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [exporting, setExporting] = useState(false);

  const [form, setForm] = useState({
    dataType: 'revenue' as DataType,
    startDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error('请选择日期范围');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error('开始日期必须早于结束日期');
      return;
    }
    setExporting(true);
    try {
      const blob = await reportsApi.exportCsv({
        hospitalId: selectedHospitalId ?? undefined,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.dataType}-export-${form.startDate}-to-${form.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('导出成功');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '导出数据失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="导出数据"
        subtitle="下载 CSV 格式报表"
        breadcrumbs={[
          { label: '报表', href: '/admin/reports' },
          { label: '导出' },
        ]}
      />

      <form
        onSubmit={handleExport}
        className="mx-auto max-w-lg space-y-6 rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-3 pb-4 border-b border-ivory-200/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50">
            <FileDown className="h-7 w-7 text-sage-600" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            选择数据类型和日期范围以生成 CSV 导出文件。
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            数据类型 <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.dataType}
            onChange={(e) => handleChange('dataType', e.target.value)}
            options={DATA_TYPE_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              开始日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              结束日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {selectedHospitalId && (
          <div className="rounded-md bg-sage-50 p-3 text-sm text-sage-700">
            导出将按当前选择的医院进行筛选。
          </div>
        )}

        {!selectedHospitalId && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            未选择医院，导出将包含所有医院的数据。
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            loading={exporting}
            icon={<Download className="h-4 w-4" />}
          >
            导出 CSV
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
