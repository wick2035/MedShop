import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { SettlementRecord } from '@/types/report';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

import { reportsApi } from '@/api/reports.api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function SettlementListPage() {
  const { selectedHospitalId } = useHospitalContextStore();

  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Generate dialog state
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    periodStart: '',
    periodEnd: '',
  });

  // Confirm action
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getSettlements({
        hospitalId: selectedHospitalId ?? undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setSettlements(result);
        setTotalPages(1);
      } else {
        const paginated = result as PaginatedResponse<SettlementRecord>;
        setSettlements(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载结算记录失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [page, selectedHospitalId]);

  const handleGenerate = async () => {
    if (!generateForm.periodStart || !generateForm.periodEnd) {
      toast.error('请选择开始和结束日期');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('请先选择医院');
      return;
    }
    setGenerating(true);
    try {
      await reportsApi.generateSettlement({
        hospitalId: selectedHospitalId,
        periodStart: generateForm.periodStart,
        periodEnd: generateForm.periodEnd,
      });
      toast.success('结算报告已生成');
      setShowGenerate(false);
      setGenerateForm({ periodStart: '', periodEnd: '' });
      fetchSettlements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '生成结算报告失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async (settlementId: string) => {
    setConfirmingId(settlementId);
    try {
      await reportsApi.confirmSettlement(settlementId);
      toast.success('结算已确认');
      fetchSettlements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '确认结算失败');
    } finally {
      setConfirmingId(null);
    }
  };

  const columns: DataTableColumn<SettlementRecord>[] = [
    {
      key: 'settlementNo',
      header: '结算编号',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.settlementNo}</span>,
    },
    {
      key: 'settlementPeriodStart',
      header: '结算周期',
      render: (row) => (
        <span className="text-sm">
          {formatDate(row.settlementPeriodStart)} ~ {formatDate(row.settlementPeriodEnd)}
        </span>
      ),
    },
    {
      key: 'totalTransactions',
      header: '交易数',
      render: (row) => <span className="text-sm">{row.totalTransactions}</span>,
    },
    {
      key: 'grossAmount',
      header: '总额',
      render: (row) => <span className="text-sm font-medium">{formatCurrency(row.grossAmount)}</span>,
    },
    {
      key: 'refundAmount',
      header: '退款',
      render: (row) => (
        <span className={row.refundAmount > 0 ? 'text-sm text-red-600' : 'text-sm text-gray-400'}>
          {formatCurrency(row.refundAmount)}
        </span>
      ),
    },
    {
      key: 'platformFee',
      header: '平台费用',
      render: (row) => <span className="text-sm text-gray-500">{formatCurrency(row.platformFee)}</span>,
    },
    {
      key: 'netAmount',
      header: '净额',
      render: (row) => <span className="text-sm font-semibold text-emerald-600">{formatCurrency(row.netAmount)}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => {
        const variant = row.status === 'CONFIRMED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default';
        const label = row.status === 'CONFIRMED' ? '已确认' : row.status === 'PENDING' ? '待处理' : row.status;
        return <Badge variant={variant} size="sm">{label}</Badge>;
      },
    },
    {
      key: 'settledAt',
      header: '结算时间',
      render: (row) => (
        <span className="text-xs text-gray-500">{row.settledAt ? formatDateTime(row.settledAt) : '--'}</span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Button
            variant="outline"
            size="sm"
            loading={confirmingId === row.id}
            icon={<CheckCircle className="h-3.5 w-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm(row.id);
            }}
          >
            确认
          </Button>
        ) : null,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchSettlements}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="结算管理"
        subtitle="医院结算记录"
        breadcrumbs={[
          { label: '报表', href: '/admin/reports' },
          { label: '结算' },
        ]}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowGenerate(true)}>
            生成
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={settlements as any} loading={loading} emptyMessage="暂无结算记录" />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="text-sm text-gray-500">第 {page + 1} 页 / 共 {totalPages} 页</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      )}

      {/* Generate Settlement Dialog */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-sage-800 mb-4">生成结算</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  开始日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={generateForm.periodStart}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, periodStart: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  结束日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={generateForm.periodEnd}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowGenerate(false)}>取消</Button>
              <Button loading={generating} onClick={handleGenerate}>生成</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
