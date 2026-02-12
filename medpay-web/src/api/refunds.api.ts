import { client, unwrapPage } from './client';
import type { RefundCreateRequest, RefundResponse } from '@/types/refund';

export interface RefundListParams {
  hospitalId?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const refundsApi = {
  /** Create a refund request */
  create(body: RefundCreateRequest): Promise<RefundResponse> {
    return client
      .post('/api/v1/refunds', body)
      .then((r) => r.data as RefundResponse);
  },

  /** Get a single refund by ID */
  getById(id: string): Promise<RefundResponse> {
    return client
      .get(`/api/v1/refunds/${id}`)
      .then((r) => r.data as RefundResponse);
  },

  /** List refunds with optional filters and pagination */
  list(params?: RefundListParams): Promise<RefundResponse[]> {
    return client
      .get('/api/v1/refunds', { params })
      .then((r) => unwrapPage<RefundResponse>(r.data));
  },

  /** Approve a refund request */
  approve(refundId: string, comment?: string): Promise<RefundResponse> {
    return client
      .put(`/api/v1/refunds/${refundId}/approve`, null, {
        params: comment ? { comment } : undefined,
      })
      .then((r) => r.data as RefundResponse);
  },

  /** Reject a refund request */
  reject(refundId: string, comment?: string): Promise<RefundResponse> {
    return client
      .put(`/api/v1/refunds/${refundId}/reject`, null, {
        params: comment ? { comment } : undefined,
      })
      .then((r) => r.data as RefundResponse);
  },
};
