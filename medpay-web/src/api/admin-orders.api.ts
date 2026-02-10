import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { OrderResponse } from '@/types/order';
import type { OrderStatus, OrderType } from '@/types/enums';

export interface AdminOrderListParams {
  hospitalId?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  page?: number;
  size?: number;
}

export const adminOrdersApi = {
  /** List all orders for admin with filters and pagination */
  list(
    params?: AdminOrderListParams,
  ): Promise<PaginatedResponse<OrderResponse>> {
    return client
      .get('/api/v1/admin/orders', { params })
      .then((r) => r.data as PaginatedResponse<OrderResponse>);
  },

  /** Transition order status via a state-machine event */
  updateStatus(id: string, event: string): Promise<OrderResponse> {
    return client
      .put(`/api/v1/admin/orders/${id}/status`, null, {
        params: { event },
      })
      .then((r) => r.data as OrderResponse);
  },

  /** Get order statistics for a hospital */
  getStatistics(hospitalId?: string): Promise<Record<string, unknown>> {
    return client
      .get('/api/v1/admin/orders/statistics', {
        params: hospitalId ? { hospitalId } : undefined,
      })
      .then((r) => r.data as Record<string, unknown>);
  },
};
