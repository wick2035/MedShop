import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { LedgerResponse } from '@/types/payment';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { ledgerApi } from '@/api/ledger.api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function LedgerPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [entries, setEntries] = useState<LedgerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ledgerApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setEntries(result);
        setTotalPages(1);
      } else {
        const paginated = result as unknown as PaginatedResponse<LedgerResponse>;
        setEntries(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载账本失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [page, selectedHospitalId]);

  const columns: DataTableColumn<LedgerResponse>[] = [
    {
      key: 'ledgerNo',
      header: '账本编号',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.ledgerNo}</span>,
    },
    {
      key: 'transactionType',
      header: '类型',
      render: (row) => {
        const isCredit = row.direction === 'CREDIT' || row.amount > 0;
        return (
          <Badge variant={isCredit ? 'success' : 'error'} size="sm">
            {row.transactionType}
          </Badge>
        );
      },
    },
    {
      key: 'amount',
      header: '金额',
      sortable: true,
      render: (row) => (
        <span className={`font-medium ${row.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'referenceType',
      header: '关联类型',
      render: (row) => <span className="text-sm">{row.referenceType}</span>,
    },
    {
      key: 'description',
      header: '描述',
      render: (row) => <span className="text-xs text-gray-500">{row.description}</span>,
    },
    {
      key: 'createdAt',
      header: '日期',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchLedger}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="支付账本" subtitle="所有交易的详细账本记录" />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={entries as any} loading={loading} emptyMessage="暂无账本记录" />
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
