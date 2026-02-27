import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { ReconciliationBatchResponse } from '@/types/reconciliation';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { reconciliationApi } from '@/api/reconciliation.api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReconciliationListPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<ReconciliationBatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reconciliationApi.getBatches({ page, size: 20 });
      if (Array.isArray(result)) {
        setBatches(result);
        setTotalPages(1);
      } else {
        const paginated = result as unknown as PaginatedResponse<ReconciliationBatchResponse>;
        setBatches(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载对账批次失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page]);

  const columns: DataTableColumn<ReconciliationBatchResponse>[] = [
    {
      key: 'batchNo',
      header: '批次号',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.batchNo}</span>,
    },
    {
      key: 'reconciliationDate',
      header: '日期',
      render: (row) => <span className="text-sm">{formatDate(row.reconciliationDate)}</span>,
    },
    { key: 'channel', header: '渠道' },
    {
      key: 'matchedCount',
      header: '已匹配',
      render: (row) => <span className="text-emerald-600">{row.matchedCount}</span>,
    },
    {
      key: 'mismatchedCount',
      header: '未匹配',
      render: (row) => (
        <span className={row.mismatchedCount > 0 ? 'font-medium text-red-600' : 'text-gray-500'}>
          {row.mismatchedCount}
        </span>
      ),
    },
    {
      key: 'systemTotalAmount',
      header: '系统金额',
      render: (row) => <span className="text-sm">{formatCurrency(row.systemTotalAmount)}</span>,
    },
    {
      key: 'channelTotalAmount',
      header: '渠道金额',
      render: (row) => <span className="text-sm">{formatCurrency(row.channelTotalAmount)}</span>,
    },
    {
      key: 'differenceAmount',
      header: '差异',
      render: (row) => (
        <span className={row.differenceAmount !== 0 ? 'font-medium text-red-600' : 'text-gray-500'}>
          {formatCurrency(row.differenceAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => {
        const variant = row.status === 'COMPLETED' ? 'success' : row.status === 'IN_PROGRESS' ? 'warning' : 'default';
        const label = row.status === 'COMPLETED' ? '已完成' : row.status === 'IN_PROGRESS' ? '进行中' : row.status === 'FAILED' ? '失败' : row.status;
        return <Badge variant={variant} size="sm">{label}</Badge>;
      },
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchBatches}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="对账管理"
        subtitle="支付对账批次"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/admin/reconciliation/trigger')}>
            触发
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns as any}
          data={batches as any}
          loading={loading}
          emptyMessage="暂无对账批次"
          onRowClick={(row) => navigate(`/admin/reconciliation/${row.id}`)}
        />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="text-sm text-gray-500">第 {page + 1} 页 / 共 {totalPages} 页</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      )}
    </PageContainer>
  );
}
