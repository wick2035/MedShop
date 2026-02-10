import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type {
  OrderCreateRequest,
  AppointmentOrderRequest,
  OrderResponse,
} from '@/types/order';

export interface OrderListParams {
  page?: number;
  size?: number;
}

export const ordersApi = {
  /** Create a new order (requires X-Patient-Id header) */
  create(body: OrderCreateRequest, patientId: string): Promise<OrderResponse> {
    return client
      .post('/api/v1/orders', body, {
        headers: { 'X-Patient-Id': patientId },
      })
      .then((r) => r.data as OrderResponse);
  },

  /** List orders for the current patient (requires X-Patient-Id header) */
  list(
    patientId: string,
    params?: OrderListParams,
  ): Promise<PaginatedResponse<OrderResponse>> {
    return client
      .get('/api/v1/orders', {
        params,
        headers: { 'X-Patient-Id': patientId },
      })
      .then((r) => r.data as PaginatedResponse<OrderResponse>);
  },

  /** Get a single order by ID */
  getById(id: string): Promise<OrderResponse> {
    return client
      .get(`/api/v1/orders/${id}`)
      .then((r) => r.data as OrderResponse);
  },

  /** Cancel an order with an optional reason */
  cancel(id: string, reason?: string): Promise<void> {
    return client
      .put(`/api/v1/orders/${id}/cancel`, null, {
        params: reason ? { reason } : undefined,
      })
      .then(() => undefined);
  },

  /** Create an appointment-type order (requires X-Patient-Id header) */
  createAppointment(
    body: AppointmentOrderRequest,
    patientId: string,
  ): Promise<OrderResponse> {
    return client
      .post('/api/v1/orders/appointment', body, {
        headers: { 'X-Patient-Id': patientId },
      })
      .then((r) => r.data as OrderResponse);
  },
};
