import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import type { PaymentStatusResponse } from '@/types/payment';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { paymentsApi } from '@/api/payments.api';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_CHANNEL_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function PaymentListPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [payments, setPayments] = useState<PaymentStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentsApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setPayments(result);
        setTotalPages(1);
      } else {
        const paginated = result as PaginatedResponse<PaymentStatusResponse>;
        setPayments(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payments';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, selectedHospitalId]);

  const columns: DataTableColumn<PaymentStatusResponse>[] = [
    {
      key: 'transactionNo',
      header: 'Transaction No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.transactionNo}</span>,
    },
    {
      key: 'paymentChannel',
      header: 'Channel',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {PAYMENT_CHANNEL_LABELS[row.paymentChannel] ?? row.paymentChannel}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            PAYMENT_STATUS_COLORS[row.status as keyof typeof PAYMENT_STATUS_COLORS] ?? 'bg-gray-100 text-gray-700',
          )}
        >
          {PAYMENT_STATUS_LABELS[row.status as keyof typeof PAYMENT_STATUS_LABELS] ?? row.status}
        </span>
      ),
    },
    {
      key: 'paidAt',
      header: 'Paid At',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.paidAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchPayments}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Payment Records" subtitle="View all payment transactions" />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={payments as any} loading={loading} emptyMessage="No payments found" />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </PageContainer>
  );
}
