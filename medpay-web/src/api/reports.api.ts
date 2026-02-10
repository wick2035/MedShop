import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type {
  DashboardKpiResponse,
  SettlementGenerateRequest,
  SettlementRecord,
} from '@/types/report';

export interface SettlementListParams {
  hospitalId?: string;
  page?: number;
  size?: number;
}

export interface CsvExportParams {
  hospitalId?: string;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  /** Get dashboard KPI data for a hospital */
  getDashboard(hospitalId?: string): Promise<DashboardKpiResponse> {
    return client
      .get('/api/v1/reports/dashboard', {
        params: hospitalId ? { hospitalId } : undefined,
      })
      .then((r) => r.data as DashboardKpiResponse);
  },

  /** Trigger settlement report generation */
  generateSettlement(body: SettlementGenerateRequest): Promise<Record<string, unknown>> {
    return client
      .post('/api/v1/reports/settlements/generate', body)
      .then((r) => r.data as Record<string, unknown>);
  },

  /** List settlement records with pagination */
  getSettlements(
    params?: SettlementListParams,
  ): Promise<PaginatedResponse<SettlementRecord>> {
    return client
      .get('/api/v1/reports/settlements', { params })
      .then((r) => r.data as PaginatedResponse<SettlementRecord>);
  },

  /** Confirm a settlement record */
  confirmSettlement(settlementId: string): Promise<void> {
    return client
      .put(`/api/v1/reports/settlements/${settlementId}/confirm`)
      .then(() => undefined);
  },

  /** Export report data as CSV (returns a Blob) */
  exportCsv(params: CsvExportParams): Promise<Blob> {
    return client
      .get('/api/v1/reports/export/csv', {
        params,
        responseType: 'blob',
      })
      .then((r) => r.data as Blob);
  },
};
