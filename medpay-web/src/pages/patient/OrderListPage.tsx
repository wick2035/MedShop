import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { ordersApi } from '@/api/orders.api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from '@/lib/constants';
import { OrderStatus } from '@/types/enums';
import type { OrderResponse } from '@/types/order';

const statusTabs: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: ORDER_STATUS_LABELS[OrderStatus.CREATED] || 'Pending Payment', value: OrderStatus.CREATED },
  { label: ORDER_STATUS_LABELS[OrderStatus.PAID] || 'Paid', value: OrderStatus.PAID },
  { label: ORDER_STATUS_LABELS[OrderStatus.COMPLETED] || 'Completed', value: OrderStatus.COMPLETED },
  { label: ORDER_STATUS_LABELS[OrderStatus.CANCELLED] || 'Cancelled', value: OrderStatus.CANCELLED },
  { label: ORDER_STATUS_LABELS[OrderStatus.REFUNDED] || 'Refunded', value: OrderStatus.REFUNDED },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const activeStatus = searchParams.get('status') || '';
  const currentPage = Number(searchParams.get('page') || '0');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await ordersApi.list(user.patientId ?? user.id, { page: currentPage, size: 10 });
      const allOrders = result.content;
      // Client-side status filter since the API might not support it
      const filtered = activeStatus
        ? allOrders.filter((o) => o.status === activeStatus)
        : allOrders;
      setOrders(filtered);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, activeStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function setActiveStatus(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('status', value);
    else params.delete('status');
    params.set('page', '0');
    setSearchParams(params);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="My Orders" subtitle="View and manage your orders" />
      </motion.div>

      {/* Status filter tabs */}
      <motion.div variants={itemVariants} className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? 'bg-sage-500 text-white'
                : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchOrders}>
            Retry
          </Button>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="py-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">No orders found</p>
          <button
            onClick={() => navigate('/patient/services')}
            className="mt-3 text-sm font-medium text-sage-500 hover:text-sage-600"
          >
            Browse services
          </button>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              hover
              className="cursor-pointer p-4"
            >
              <button
                onClick={() => navigate(`/patient/orders/${order.id}`)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50">
                    <Calendar className="h-5 w-5 text-sage-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-sage-800">{order.orderNo}</span>
                      <Badge variant="sage" size="sm">
                        {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-sage-800">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <StatusBadge status={order.status} type="order" />
                </div>
              </button>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 0}
            onClick={() => goToPage(currentPage - 1)}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <span className="text-sm text-sage-700/60">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => goToPage(currentPage + 1)}
            icon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
