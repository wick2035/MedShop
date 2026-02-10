import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { Reimbursement } from '@/types/insurance';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { insuranceApi } from '@/api/insurance.api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function InsuranceReimbursementsPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReimbursements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insuranceApi.getReimbursements({
        hospitalId: selectedHospitalId ?? undefined,
      });
      setReimbursements(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reimbursements';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReimbursements();
  }, [selectedHospitalId]);

  const columns: DataTableColumn<Reimbursement>[] = [
    {
      key: 'id',
      header: 'Reimbursement ID',
      render: (row) => <span className="font-mono text-xs text-sage-700">#{row.id.substring(0, 8)}</span>,
    },
    {
      key: 'claimId',
      header: 'Claim ID',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.claimId.substring(0, 8)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => <span className="font-medium text-emerald-600">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant = row.status === 'COMPLETED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default';
        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      },
    },
    {
      key: 'processedAt',
      header: 'Processed At',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.processedAt)}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchReimbursements}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Insurance Reimbursements" subtitle="Track reimbursement payments from insurance" />
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns} data={reimbursements} loading={loading} emptyMessage="No reimbursements found" />
      </motion.div>
    </PageContainer>
  );
}
