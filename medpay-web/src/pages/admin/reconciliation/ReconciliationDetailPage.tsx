import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { ReconciliationDetail } from '@/types/reconciliation';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import StatCard from '@/components/data/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

import { reconciliationApi } from '@/api/reconciliation.api';
import { formatCurrency, formatDateTime } from '@/lib/utils';

import { FileCheck, FileX, FileMinus, DollarSign } from 'lucide-react';

export default function ReconciliationDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<ReconciliationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const fetchDetails = async () => {
    if (!batchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reconciliationApi.getDetails(batchId);
      setDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载详情失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [batchId]);

  const handleResolve = async (detailId: string) => {
    if (!resolveNote.trim()) {
      toast.error('请添加处理说明');
      return;
    }
    try {
      await reconciliationApi.resolveDetail(detailId, { resolutionNote: resolveNote });
      toast.success('已处理');
      setResolvingId(null);
      setResolveNote('');
      fetchDetails();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '处理失败');
    }
  };

  const matched = details.filter((d) => d.matchStatus === 'MATCHED').length;
  const mismatched = details.filter((d) => d.matchStatus !== 'MATCHED').length;
  const totalDiff = details.reduce((s, d) => s + Math.abs((d.systemAmount ?? 0) - (d.channelAmount ?? 0)), 0);

  const columns: DataTableColumn<ReconciliationDetail>[] = [
    {
      key: 'paymentTransactionId',
      header: '系统交易号',
      render: (row) => <span className="font-mono text-xs">{row.paymentTransactionId ?? '--'}</span>,
    },
    {
      key: 'channelTransactionId',
      header: '渠道交易号',
      render: (row) => <span className="font-mono text-xs">{row.channelTransactionId ?? '--'}</span>,
    },
    {
      key: 'systemAmount',
      header: '系统金额',
      render: (row) => <span className="text-sm">{formatCurrency(row.systemAmount)}</span>,
    },
    {
      key: 'channelAmount',
      header: '渠道金额',
      render: (row) => <span className="text-sm">{formatCurrency(row.channelAmount)}</span>,
    },
    {
      key: 'matchStatus',
      header: '匹配',
      render: (row) => (
        <Badge variant={row.matchStatus === 'MATCHED' ? 'success' : 'error'} size="sm">
          {row.matchStatus === 'MATCHED' ? '已匹配' : row.matchStatus === 'MISMATCHED' ? '未匹配' : row.matchStatus}
        </Badge>
      ),
    },
    {
      key: 'resolutionStatus',
      header: '处理状态',
      render: (row) => (
        <Badge variant={row.resolutionStatus === 'RESOLVED' ? 'success' : row.resolutionStatus === 'PENDING' ? 'warning' : 'default'} size="sm">
          {row.resolutionStatus === 'RESOLVED' ? '已处理' : row.resolutionStatus === 'PENDING' ? '待处理' : row.resolutionStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (row) =>
        row.matchStatus !== 'MATCHED' && row.resolutionStatus !== 'RESOLVED' ? (
          resolvingId === row.id ? (
            <div className="flex items-center gap-2">
              <Input
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="处理说明"
                className="w-40"
              />
              <Button size="sm" onClick={() => handleResolve(row.id)}>
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setResolvingId(null)}>
                取消
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => { setResolvingId(row.id); setResolveNote(''); }}>
              处理
            </Button>
          )
        ) : null,
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchDetails}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="对账详情"
        breadcrumbs={[
          { label: '对账', href: '/admin/reconciliation' },
          { label: `批次 ${batchId?.substring(0, 8)}` },
        ]}
        actions={
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/reconciliation')}>
            返回
          </Button>
        }
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}><StatCard icon={FileCheck} label="总记录数" value={details.length} prefix="" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={FileCheck} label="已匹配" value={matched} prefix="" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={FileX} label="未匹配" value={mismatched} prefix="" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={DollarSign} label="总差异" value={totalDiff} prefix="¥" /></motion.div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable columns={columns as any} data={details as any} loading={false} emptyMessage="暂无详情" />
      </motion.div>
    </PageContainer>
  );
}
