import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { InsuranceClaim } from '@/types/insurance';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { insuranceApi } from '@/api/insurance.api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function InsuranceClaimsPage() {
  const { selectedHospitalId } = useHospitalContextStore();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insuranceApi.getClaims({
        hospitalId: selectedHospitalId ?? undefined,
      });
      const items = Array.isArray(data) ? data : (data as any)?.content ?? [];
      setClaims(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载理赔失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [selectedHospitalId]);

  const columns: DataTableColumn<InsuranceClaim>[] = [
    {
      key: 'id',
      header: '理赔编号',
      render: (row) => <span className="font-mono text-xs text-sage-700">#{row.id.substring(0, 8)}</span>,
    },
    { key: 'patientId', header: '患者', render: (row) => <span className="font-mono text-xs">{row.patientId.slice(0, 8)}</span> },
    {
      key: 'claimAmount',
      header: '总金额',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: 'insurancePays',
      header: '医保支付',
      render: (row) => <span className="text-emerald-600">{formatCurrency(row.insurancePays)}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => {
        const variant = row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : row.status === 'PENDING' ? 'warning' : 'default';
        return <Badge variant={variant} size="sm">{row.status === 'APPROVED' ? '已批准' : row.status === 'REJECTED' ? '已拒绝' : row.status === 'PENDING' ? '待审批' : row.status}</Badge>;
      },
    },
    {
      key: 'submittedAt',
      header: '提交时间',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.submittedAt)}</span>,
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchClaims}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="医保理赔" subtitle="查看和跟踪医保理赔提交" />
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={claims as any} loading={loading} emptyMessage="暂无医保理赔记录" />
      </motion.div>
    </PageContainer>
  );
}
