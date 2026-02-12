import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { RefundResponse } from '@/types/refund';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { refundsApi } from '@/api/refunds.api';
import { formatCurrency, formatDateTime, truncate, cn } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

const REFUND_STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Completed', value: 'COMPLETED' },
];

const REFUND_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'error' | 'default' | 'sage'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'sage',
};

export default function RefundListPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await refundsApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        status: statusFilter || undefined,
      });
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load refunds';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, selectedHospitalId]);

  const columns: DataTableColumn<RefundResponse>[] = [
    {
      key: 'id',
      header: 'Refund No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">#{row.id.substring(0, 8)}</span>,
    },
    {
      key: 'orderNo',
      header: 'Order No.',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.orderNo}</span>,
    },
    {
      key: 'refundAmount',
      header: 'Amount',
      sortable: true,
      render: (row) => <span className="font-medium text-red-600">{formatCurrency(row.refundAmount)}</span>,
    },
    {
      key: 'refundReason',
      header: 'Reason',
      render: (row) => <span className="text-xs text-gray-500">{truncate(row.refundReason, 30)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={REFUND_STATUS_VARIANTS[row.status] ?? 'default'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/refunds/${row.id}/review`);
            }}
          >
            Review
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
          <Button variant="outline" onClick={fetchRefunds}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Refund Approval" subtitle="Review and process refund requests" />

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-ivory-200/60 bg-white/70 p-1">
        {REFUND_STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === tab.value ? 'bg-sage-500 text-white' : 'text-gray-600 hover:bg-ivory-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={refunds as any} loading={loading} emptyMessage="No refund requests found" />
      </motion.div>
    </PageContainer>
  );
}
