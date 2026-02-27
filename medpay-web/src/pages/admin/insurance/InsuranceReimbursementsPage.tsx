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
      const items = Array.isArray(data) ? data : (data as any)?.content ?? [];
      setReimbursements(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载报销记录失败';
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
      header: '报销编号',
      render: (row) => <span className="font-mono text-xs text-sage-700">#{row.id.substring(0, 8)}</span>,
    },
    {
      key: 'claimId',
      header: '理赔编号',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.claimId?.substring(0, 8) ?? '--'}</span>,
    },
    {
      key: 'amount',
      header: '金额',
      sortable: true,
      render: (row) => <span className="font-medium text-emerald-600">{formatCurrency(row.reimbursedAmount)}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => {
        const variant = row.status === 'COMPLETED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default';
        const label = row.status === 'COMPLETED' ? '已完成' : row.status === 'PENDING' ? '待处理' : row.status;
        return <Badge variant={variant} size="sm">{label}</Badge>;
      },
    },
    {
      key: 'processedAt',
      header: '处理时间',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.completedAt)}</span>,
    },
    {
      key: 'createdAt',
      header: '创建时间',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchReimbursements}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="医保报销" subtitle="跟踪医保报销付款" />
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={reimbursements as any} loading={loading} emptyMessage="暂无报销记录" />
      </motion.div>
    </PageContainer>
  );
}
