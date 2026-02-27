import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { RefundResponse } from '@/types/refund';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';

import { refundsApi } from '@/api/refunds.api';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function RefundReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [refund, setRefund] = useState<RefundResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRefund = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await refundsApi.getById(id);
      setRefund(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载退款详情失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefund();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await refundsApi.approve(id, comment || undefined);
      toast.success('退款已批准');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '批准退款失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !comment.trim()) {
      toast.error('请提供拒绝原因');
      return;
    }
    setSubmitting(true);
    try {
      await refundsApi.reject(id, comment || undefined);
      toast.success('退款已拒绝');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '拒绝退款失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error || !refund) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? '退款未找到'}</p>
          <Button variant="outline" onClick={fetchRefund}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="退款审核"
        breadcrumbs={[
          { label: '退款', href: '/admin/refunds' },
          { label: `#${refund.id.substring(0, 8)}` },
        ]}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6">
        {/* Refund Details */}
        <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-sage-800">退款详情</h3>
            <Badge variant={refund.status === 'PENDING' ? 'warning' : refund.status === 'APPROVED' ? 'success' : 'error'} size="sm">
              {refund.status === 'PENDING' ? '待审批' : refund.status === 'APPROVED' ? '已批准' : refund.status === 'REJECTED' ? '已拒绝' : refund.status === 'COMPLETED' ? '已完成' : refund.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">退款编号</p>
              <p className="font-mono text-sm text-gray-700">{refund.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">订单号</p>
              <p className="font-mono text-sm text-gray-700">{refund.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">患者</p>
              <p className="text-sm font-medium text-gray-700">{refund.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">金额</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(refund.refundAmount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">原因</p>
              <p className="mt-1 text-sm text-gray-700">{refund.refundReason}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">申请时间</p>
              <p className="text-sm text-gray-700">{formatDateTime(refund.createdAt)}</p>
            </div>
          </div>
        </motion.div>

        {/* Review Form */}
        {refund.status === 'PENDING' && (
          <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">审批意见</h3>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">备注</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请添加备注（拒绝时必填）..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="danger"
                icon={<XCircle className="h-4 w-4" />}
                loading={submitting}
                onClick={handleReject}
              >
                拒绝
              </Button>
              <Button
                icon={<CheckCircle className="h-4 w-4" />}
                loading={submitting}
                onClick={handleApprove}
              >
                批准
              </Button>
            </div>
          </motion.div>
        )}

        {/* Previous decision */}
        {refund.status !== 'PENDING' && refund.reviewComment && (
          <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
            <h3 className="mb-2 font-display text-lg font-semibold text-sage-800">审批结果</h3>
            <p className="text-sm text-gray-600">{refund.reviewComment}</p>
            {refund.reviewedAt && (
              <p className="mt-2 text-xs text-gray-400">
                审核时间：{formatDateTime(refund.reviewedAt)}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
