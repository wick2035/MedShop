import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { SplitPayResponse } from '@/types/payment';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

import { paymentsApi } from '@/api/payments.api';
import { PAYMENT_STATUS_LABELS, PAYMENT_CHANNEL_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function InsuranceSplitsPage() {
  const [splits, setSplits] = useState<SplitPayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchSplits = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an Order ID');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await paymentsApi.getSplits(orderId.trim());
      setSplits(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load split payments';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const columns: DataTableColumn<SplitPayResponse>[] = [
    {
      key: 'transactionNo',
      header: 'Transaction No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.transactionNo}</span>,
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {PAYMENT_CHANNEL_LABELS[row.channel] ?? row.channel}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant = row.status === 'SUCCESS' ? 'success' : row.status === 'FAILED' ? 'error' : 'warning';
        return (
          <Badge variant={variant} size="sm">
            {PAYMENT_STATUS_LABELS[row.status as keyof typeof PAYMENT_STATUS_LABELS] ?? row.status}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="Split Payments" subtitle="View split payment details for insurance co-pay orders" />

      {/* Search by Order ID */}
      <div className="mb-6 flex items-end gap-3">
        <div className="flex-1 max-w-md">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Order ID</label>
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID to search..."
            onKeyDown={(e) => e.key === 'Enter' && fetchSplits()}
          />
        </div>
        <Button icon={<Search className="h-4 w-4" />} onClick={fetchSplits} loading={loading}>
          Search
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {searched && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <DataTable columns={columns} data={splits} loading={loading} emptyMessage="No split payments found for this order" />
        </motion.div>
      )}

      {!searched && (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <Search className="h-12 w-12 text-gray-300" />
          <p className="text-sm">Enter an Order ID to view split payment details</p>
        </div>
      )}
    </PageContainer>
  );
}
