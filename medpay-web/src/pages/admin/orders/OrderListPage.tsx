import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import type { OrderResponse } from '@/types/order';
import type { PaginatedResponse } from '@/types/api';
import { OrderStatus } from '@/types/enums';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

const TAB_STATUSES: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Created', value: OrderStatus.CREATED },
  { label: 'Paid', value: OrderStatus.PAID },
  { label: 'Processing', value: OrderStatus.PROCESSING },
  { label: 'Completed', value: OrderStatus.COMPLETED },
  { label: 'Cancelled', value: OrderStatus.CANCELLED },
  { label: 'Refunded', value: OrderStatus.REFUNDED },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.CREATED]: ['CANCEL'],
  [OrderStatus.PAID]: ['PROCESS', 'CANCEL'],
  [OrderStatus.PROCESSING]: ['COMPLETE'],
  [OrderStatus.COMPLETED]: ['CLOSE'],
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminOrdersApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        status: statusFilter ? (statusFilter as OrderStatus) : undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setOrders(result);
        setTotalPages(1);
      } else {
        const paginated = result as unknown as PaginatedResponse<OrderResponse>;
        setOrders(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, selectedHospitalId]);

  const handleStatusChange = async (orderId: string, event: string) => {
    try {
      await adminOrdersApi.updateStatus(orderId, event);
      toast.success('Order status updated');
      setActionMenuId(null);
      fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const columns: DataTableColumn<OrderResponse>[] = [
    {
      key: 'orderNo',
      header: 'Order No.',
      render: (row) => <span className="font-mono text-xs text-sage-700">{row.orderNo}</span>,
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {ORDER_TYPE_LABELS[row.orderType] ?? row.orderType}
        </Badge>
      ),
    },
    { key: 'patientName', header: 'Patient' },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            ORDER_STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-700',
          )}
        >
          {ORDER_STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const transitions = STATUS_TRANSITIONS[row.status] ?? [];
        return (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setActionMenuId(actionMenuId === row.id ? null : row.id);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {actionMenuId === row.id && (
              <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-md border border-ivory-200 bg-white py-1 shadow-lg">
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-ivory-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenuId(null);
                    navigate(`/admin/orders/${row.id}`);
                  }}
                >
                  View Details
                </button>
                {transitions.map((event) => (
                  <button
                    key={event}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-ivory-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(row.id, event);
                    }}
                  >
                    {event.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchOrders}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Order Management" subtitle="View and manage all orders" />

      {/* Status Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-ivory-200/60 bg-white/70 p-1">
        {TAB_STATUSES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(0); }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === tab.value
                ? 'bg-sage-500 text-white'
                : 'text-gray-600 hover:bg-ivory-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found"
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </PageContainer>
  );
}
