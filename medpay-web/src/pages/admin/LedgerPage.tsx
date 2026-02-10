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
      const msg = err instanceof Error ? err.message : 'Failed to load ledger';
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
      key: 'transactionNo',
      header: 'Transaction No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.transactionNo}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const isCredit = row.type?.toLowerCase().includes('credit') || row.amount > 0;
        return (
          <Badge variant={isCredit ? 'success' : 'error'} size="sm">
            {row.type}
          </Badge>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <span className={`font-medium ${row.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'balanceBefore',
      header: 'Balance Before',
      render: (row) => <span className="text-sm">{formatCurrency(row.balanceBefore)}</span>,
    },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      render: (row) => <span className="text-sm font-medium">{formatCurrency(row.balanceAfter)}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-xs text-gray-500">{row.description}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchLedger}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Payment Ledger" subtitle="Detailed ledger entries for all transactions" />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns} data={entries} loading={loading} emptyMessage="No ledger entries found" />
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
