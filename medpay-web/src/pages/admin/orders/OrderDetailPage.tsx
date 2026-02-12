import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import type { OrderResponse } from '@/types/order';
import type { PaymentStatusResponse } from '@/types/payment';
import type { RefundResponse } from '@/types/refund';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ordersApi } from '@/api/orders.api';
import { paymentsApi } from '@/api/payments.api';
import { refundsApi } from '@/api/refunds.api';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['CANCEL'],
  PAID: ['PROCESS', 'CANCEL'],
  PROCESSING: ['COMPLETE'],
  COMPLETED: ['CLOSE'],
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await ordersApi.getById(id);
      setOrder(orderData);
      try {
        // No direct getByOrderId, skip payment lookup
      } catch { /* payment may not exist */ }
      try {
        const refundData = await refundsApi.list({});
        const refundList = Array.isArray(refundData) ? refundData : (refundData as any).content ?? [];
        setRefunds(refundList);
      } catch { /* refunds may not exist */ }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load order';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (event: string) => {
    if (!id) return;
    try {
      await adminOrdersApi.updateStatus(id, event);
      toast.success('Order status updated');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
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

  if (error || !order) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? 'Order not found'}</p>
          <Button variant="outline" onClick={fetchData}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  const transitions = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={`Order ${order.orderNo}`}
        breadcrumbs={[
          { label: 'Orders', href: '/admin/orders' },
          { label: order.orderNo },
        ]}
        actions={
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/orders')}>
            Back
          </Button>
        }
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Order Header */}
        <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                  ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700',
                )}
              >
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <Badge variant="sage" size="sm">
                {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
              </Badge>
            </div>
            {transitions.length > 0 && (
              <div className="flex gap-2">
                {transitions.map((event) => (
                  <Button key={event} variant="outline" size="sm" onClick={() => handleStatusChange(event)}>
                    {event.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Patient</p>
              <p className="text-sm font-medium text-gray-700">{order.patientId.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Order Source</p>
              <p className="text-sm font-medium text-gray-700">{order.orderSource}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Created</p>
              <p className="text-sm text-gray-700">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm text-gray-700">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Order Items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ivory-200 text-xs uppercase text-gray-500">
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-ivory-100">
                  <td className="px-3 py-2.5 font-medium text-gray-700">{item.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{item.itemType}</td>
                  <td className="px-3 py-2.5 text-right">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ivory-200">
                <td colSpan={4} className="px-3 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                <td className="px-3 py-3 text-right font-display text-lg font-bold text-sage-700">{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </motion.div>

        {/* Payment Breakdown */}
        <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Payment Information</h3>
          {payment ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-400">Transaction No.</p>
                <p className="font-mono text-sm text-gray-700">{payment.transactionNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Channel</p>
                <p className="text-sm text-gray-700">{payment.paymentChannel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-sm font-medium text-gray-700">{formatCurrency(payment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <Badge variant={payment.status === 'SUCCESS' ? 'success' : 'warning'} size="sm">
                  {PAYMENT_STATUS_LABELS[payment.status as keyof typeof PAYMENT_STATUS_LABELS] ?? payment.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No payment recorded</p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-4 rounded-md bg-ivory-50 p-4">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-semibold text-emerald-600">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Insurance</p>
              <p className="text-lg font-semibold text-blue-500">{formatCurrency(order.insuranceAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Self Pay</p>
              <p className="text-lg font-semibold text-sage-700">{formatCurrency(order.selfPayAmount)}</p>
            </div>
          </div>
        </motion.div>

        {/* Refund Records */}
        {refunds.length > 0 && (
          <motion.div variants={itemVariants} className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Refund Records</h3>
            <div className="space-y-3">
              {refunds.map((refund) => (
                <div key={refund.id} className="rounded-md border border-ivory-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">#{refund.id.substring(0, 8)}</span>
                    <Badge variant={refund.status === 'APPROVED' ? 'success' : refund.status === 'REJECTED' ? 'error' : 'warning'} size="sm">
                      {refund.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium">{formatCurrency(refund.refundAmount)}</p>
                  <p className="text-xs text-gray-500">{refund.refundReason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
