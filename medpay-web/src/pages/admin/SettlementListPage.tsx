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
      const msg = err instanceof Error ? err.message : 'Failed to load settlements';
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
      toast.error('Please select start and end dates');
      return;
    }
    if (!selectedHospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    setGenerating(true);
    try {
      await reportsApi.generateSettlement({
        hospitalId: selectedHospitalId,
        periodStart: generateForm.periodStart,
        periodEnd: generateForm.periodEnd,
      });
      toast.success('Settlement report generated');
      setShowGenerate(false);
      setGenerateForm({ periodStart: '', periodEnd: '' });
      fetchSettlements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate settlement');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async (settlementId: string) => {
    setConfirmingId(settlementId);
    try {
      await reportsApi.confirmSettlement(settlementId);
      toast.success('Settlement confirmed');
      fetchSettlements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm settlement');
    } finally {
      setConfirmingId(null);
    }
  };

  const columns: DataTableColumn<SettlementRecord>[] = [
    {
      key: 'settlementNo',
      header: 'Settlement No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.settlementNo}</span>,
    },
    {
      key: 'settlementPeriodStart',
      header: 'Period',
      render: (row) => (
        <span className="text-sm">
          {formatDate(row.settlementPeriodStart)} ~ {formatDate(row.settlementPeriodEnd)}
        </span>
      ),
    },
    {
      key: 'totalTransactions',
      header: 'Transactions',
      render: (row) => <span className="text-sm">{row.totalTransactions}</span>,
    },
    {
      key: 'grossAmount',
      header: 'Gross',
      render: (row) => <span className="text-sm font-medium">{formatCurrency(row.grossAmount)}</span>,
    },
    {
      key: 'refundAmount',
      header: 'Refunds',
      render: (row) => (
        <span className={row.refundAmount > 0 ? 'text-sm text-red-600' : 'text-sm text-gray-400'}>
          {formatCurrency(row.refundAmount)}
        </span>
      ),
    },
    {
      key: 'platformFee',
      header: 'Platform Fee',
      render: (row) => <span className="text-sm text-gray-500">{formatCurrency(row.platformFee)}</span>,
    },
    {
      key: 'netAmount',
      header: 'Net Amount',
      render: (row) => <span className="text-sm font-semibold text-emerald-600">{formatCurrency(row.netAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant = row.status === 'CONFIRMED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default';
        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      },
    },
    {
      key: 'settledAt',
      header: 'Settled At',
      render: (row) => (
        <span className="text-xs text-gray-500">{row.settledAt ? formatDateTime(row.settledAt) : '--'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
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
            Confirm
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
          <Button variant="outline" onClick={fetchSettlements}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settlements"
        subtitle="Hospital settlement records"
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Settlements' },
        ]}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowGenerate(true)}>
            Generate
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns} data={settlements} loading={loading} emptyMessage="No settlement records found" />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Generate Settlement Dialog */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-sage-800 mb-4">Generate Settlement</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Period Start <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={generateForm.periodStart}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, periodStart: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Period End <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={generateForm.periodEnd}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
              <Button loading={generating} onClick={handleGenerate}>Generate</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
