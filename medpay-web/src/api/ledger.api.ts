import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { LedgerResponse } from '@/types/payment';

export interface LedgerListParams {
  hospitalId?: string;
  page?: number;
  size?: number;
}

export const ledgerApi = {
  /** List ledger entries with optional filters and pagination */
  list(params?: LedgerListParams): Promise<PaginatedResponse<LedgerResponse>> {
    return client
      .get('/api/v1/ledger', { params })
      .then((r) => r.data as PaginatedResponse<LedgerResponse>);
  },
};
