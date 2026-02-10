import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/api/orders.api';
import { paymentsApi } from '@/api/payments.api';
import { formatCurrency } from '@/lib/utils';
import { PaymentChannel, PaymentStatus } from '@/types/enums';
import type { OrderResponse } from '@/types/order';
import type { PaymentInitiateResponse } from '@/types/payment';

const channels = [
  { value: PaymentChannel.MOCK, label: 'Mock Payment', icon: CreditCard, desc: 'For testing purposes' },
  { value: PaymentChannel.WECHAT, label: 'WeChat Pay', icon: Smartphone, desc: 'Pay with WeChat' },
  { value: PaymentChannel.ALIPAY, label: 'Alipay', icon: Wallet, desc: 'Pay with Alipay' },
];

type PageState = 'select' | 'processing' | 'success' | 'failed';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>(PaymentChannel.MOCK);
  const [pageState, setPageState] = useState<PageState>('select');
  const [initiating, setInitiating] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentInitiateResponse | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  async function handlePay() {
    if (!order) return;
    setInitiating(true);
    try {
      const result = await paymentsApi.initiate({
        orderId: order.id,
        paymentChannel: selectedChannel,
      });
      setPaymentResult(result);
      setPageState('processing');

      // Start polling for payment status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await paymentsApi.getStatus(result.transactionNo);
          if (status.status === PaymentStatus.SUCCESS) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setPageState('success');
            toast.success('Payment successful!');
            setTimeout(() => navigate(`/patient/orders/${order.id}`), 2000);
          } else if (status.status === PaymentStatus.FAILED) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setPageState('failed');
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment initiation failed');
      setPageState('failed');
    } finally {
      setInitiating(false);
    }
  }

  function handleRetry() {
    setPageState('select');
    setPaymentResult(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-32 rounded" />
        <div className="mt-6 skeleton-shimmer h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Order not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="mb-6 font-display text-2xl font-semibold text-sage-800">Payment</h1>
      </motion.div>

      {/* Order summary */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sage-800">Order #{order.orderNo}</p>
              <p className="mt-0.5 text-xs text-sage-700/60">{order.orderType}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-sage-800">
                {formatCurrency(order.selfPayAmount)}
              </p>
              {order.insuranceAmount > 0 && (
                <Badge variant="sage" size="sm" className="mt-1">
                  Insurance: -{formatCurrency(order.insuranceAmount)}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Payment states */}
      {pageState === 'select' && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-sage-800">
              Select Payment Method
            </h2>

            <div className="space-y-3">
              {channels.map((ch) => (
                <label
                  key={ch.value}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                    selectedChannel === ch.value
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-ivory-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="channel"
                    value={ch.value}
                    checked={selectedChannel === ch.value}
                    onChange={() => setSelectedChannel(ch.value)}
                    className="hidden"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                    <ch.icon className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sage-800">{ch.label}</p>
                    <p className="text-xs text-sage-700/60">{ch.desc}</p>
                  </div>
                  {selectedChannel === ch.value && (
                    <CheckCircle className="ml-auto h-5 w-5 text-sage-500" />
                  )}
                </label>
              ))}
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              loading={initiating}
              onClick={handlePay}
            >
              Pay {formatCurrency(order.selfPayAmount)}
            </Button>
          </Card>
        </motion.div>
      )}

      {pageState === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="py-16 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-sage-500" />
            <h2 className="mt-4 font-display text-lg font-semibold text-sage-800">
              Processing Payment
            </h2>
            <p className="mt-2 text-sm text-sage-700/60">
              Waiting for payment confirmation...
            </p>
            {paymentResult?.payUrl && (
              <a
                href={paymentResult.payUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-sage-500 underline hover:text-sage-600"
              >
                Open Payment Link
              </a>
            )}
          </Card>
        </motion.div>
      )}

      {pageState === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </motion.div>
            <h2 className="mt-4 font-display text-xl font-semibold text-sage-800">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-sage-700/60">
              Redirecting to order details...
            </p>
          </Card>
        </motion.div>
      )}

      {pageState === 'failed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="py-16 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 font-display text-xl font-semibold text-sage-800">
              Payment Failed
            </h2>
            <p className="mt-2 text-sm text-sage-700/60">
              Something went wrong with your payment.
            </p>
            <Button className="mt-6" onClick={handleRetry}>
              Try Again
            </Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
