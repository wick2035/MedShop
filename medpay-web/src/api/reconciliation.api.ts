import { client, unwrapPage } from './client';
import type { PaginatedResponse } from '@/types/api';
import type {
  ReconciliationTriggerRequest,
  ReconciliationBatchResponse,
  ReconciliationDetail,
  ReconciliationResolveRequest,
} from '@/types/reconciliation';

export interface ReconciliationBatchListParams {
  page?: number;
  size?: number;
}

export const reconciliationApi = {
  /** Trigger a new reconciliation batch */
  trigger(body: ReconciliationTriggerRequest): Promise<void> {
    return client
      .post('/api/v1/reconciliation/trigger', body)
      .then(() => undefined);
  },

  /** List reconciliation batches with pagination */
  getBatches(
    params?: ReconciliationBatchListParams,
  ): Promise<PaginatedResponse<ReconciliationBatchResponse>> {
    return client
      .get('/api/v1/reconciliation/batches', { params })
      .then((r) => r.data as PaginatedResponse<ReconciliationBatchResponse>);
  },

  /** Get detail records for a specific reconciliation batch */
  getDetails(batchId: string): Promise<ReconciliationDetail[]> {
    return client
      .get(`/api/v1/reconciliation/batches/${batchId}/details`)
      .then((r) => unwrapPage<ReconciliationDetail>(r.data));
  },

  /** Resolve a reconciliation discrepancy */
  resolveDetail(
    detailId: string,
    body: ReconciliationResolveRequest,
  ): Promise<void> {
    return client
      .put(`/api/v1/reconciliation/details/${detailId}/resolve`, body)
      .then(() => undefined);
  },
};
