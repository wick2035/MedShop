import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ordersApi } from '@/api/orders.api';
import { refundsApi } from '@/api/refunds.api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ORDER_TYPE_LABELS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { OrderStatus } from '@/types/enums';
import type { OrderResponse } from '@/types/order';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ordersApi.getById(id);
        setOrder(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id, 'Cancelled by patient');
      toast.success('Order cancelled');
      const updated = await ordersApi.getById(order.id);
      setOrder(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  }

  async function handleRefundSubmit() {
    if (!order || !refundReason.trim()) return;
    setSubmittingRefund(true);
    try {
      await refundsApi.create({
        orderId: order.id,
        refundType: 'FULL',
        refundAmount: order.selfPayAmount,
        refundReason: refundReason.trim(),
      });
      toast.success('Refund request submitted');
      setShowRefundForm(false);
      setRefundReason('');
      const updated = await ordersApi.getById(order.id);
      setOrder(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Refund request failed');
    } finally {
      setSubmittingRefund(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-40 rounded" />
        <div className="mt-6 skeleton-shimmer h-80 rounded-lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Order not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const canPay = order.status === OrderStatus.CREATED;
  const canCancel = order.status === OrderStatus.CREATED;
  const canRefund = order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate('/patient/orders')}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
      </motion.div>

      {/* Order header */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-semibold text-sage-800">
                Order #{order.orderNo}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="sage" size="sm">
                  {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                </Badge>
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sage-800">
                {formatCurrency(order.totalAmount)}
              </p>
              <p className="mt-1 text-xs text-sage-700/60">Total Amount</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Order items */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-sage-800">Order Items</h2>
          {order.items && order.items.length > 0 ? (
            <div className="divide-y divide-ivory-200">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-sage-800">{item.name}</p>
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      Qty: {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-sage-800">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sage-700/60">No items found</p>
          )}

          {/* Payment breakdown */}
          <div className="mt-4 space-y-2 border-t border-ivory-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-sage-700/60">Subtotal</span>
              <span className="text-sage-800">{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.insuranceAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-sage-700/60">Insurance Coverage</span>
                <span className="text-green-600">-{formatCurrency(order.insuranceAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-sage-800">Self-Pay Amount</span>
              <span className="text-sage-800">{formatCurrency(order.selfPayAmount)}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Order info / timestamps */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-sage-800">Order Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-sage-400" />
              <div>
                <p className="text-xs text-sage-700/60">Created</p>
                <p className="text-sm text-sage-800">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            {order.paidAt && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-sage-400" />
                <div>
                  <p className="text-xs text-sage-700/60">Paid</p>
                  <p className="text-sm text-sage-800">{formatDateTime(order.paidAt)}</p>
                </div>
              </div>
            )}
            {order.remark && (
              <div>
                <p className="text-xs text-sage-700/60">Remark</p>
                <p className="text-sm text-sage-800">{order.remark}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={itemVariants} className="mt-6 flex gap-3">
        {canPay && (
          <Button
            className="flex-1"
            onClick={() => navigate(`/patient/orders/${order.id}/pay`)}
            icon={<CreditCard className="h-4 w-4" />}
          >
            Pay Now
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="flex-1"
            loading={cancelling}
            onClick={handleCancel}
            icon={<XCircle className="h-4 w-4" />}
          >
            Cancel Order
          </Button>
        )}
        {canRefund && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowRefundForm(!showRefundForm)}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Request Refund
          </Button>
        )}
      </motion.div>

      {/* Refund form */}
      {showRefundForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <Card className="p-6">
            <h3 className="mb-3 text-base font-semibold text-sage-800">Request Refund</h3>
            <Textarea
              label="Reason for refund"
              placeholder="Please describe the reason for your refund request..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
            />
            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleRefundSubmit}
                loading={submittingRefund}
                disabled={!refundReason.trim()}
              >
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowRefundForm(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
