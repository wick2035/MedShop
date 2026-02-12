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
      const msg = err instanceof Error ? err.message : 'Failed to load refund';
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
      toast.success('Refund approved');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve refund');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await refundsApi.reject(id, comment || undefined);
      toast.success('Refund rejected');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject refund');
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
          <p>{error ?? 'Refund not found'}</p>
          <Button variant="outline" onClick={fetchRefund}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Review Refund"
        breadcrumbs={[
          { label: 'Refunds', href: '/admin/refunds' },
          { label: `#${refund.id.substring(0, 8)}` },
        ]}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6">
        {/* Refund Details */}
        <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-sage-800">Refund Details</h3>
            <Badge variant={refund.status === 'PENDING' ? 'warning' : refund.status === 'APPROVED' ? 'success' : 'error'} size="sm">
              {refund.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Refund ID</p>
              <p className="font-mono text-sm text-gray-700">{refund.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Order No.</p>
              <p className="font-mono text-sm text-gray-700">{refund.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Patient</p>
              <p className="text-sm font-medium text-gray-700">{refund.orderNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(refund.refundAmount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Reason</p>
              <p className="mt-1 text-sm text-gray-700">{refund.refundReason}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Requested At</p>
              <p className="text-sm text-gray-700">{formatDateTime(refund.createdAt)}</p>
            </div>
          </div>
        </motion.div>

        {/* Review Form */}
        {refund.status === 'PENDING' && (
          <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Your Decision</h3>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (required for rejection)..."
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
                Reject
              </Button>
              <Button
                icon={<CheckCircle className="h-4 w-4" />}
                loading={submitting}
                onClick={handleApprove}
              >
                Approve
              </Button>
            </div>
          </motion.div>
        )}

        {/* Previous decision */}
        {refund.status !== 'PENDING' && refund.reviewComment && (
          <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
            <h3 className="mb-2 font-display text-lg font-semibold text-sage-800">Decision</h3>
            <p className="text-sm text-gray-600">{refund.reviewComment}</p>
            {refund.reviewedAt && (
              <p className="mt-2 text-xs text-gray-400">
                Reviewed at: {formatDateTime(refund.reviewedAt)}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
