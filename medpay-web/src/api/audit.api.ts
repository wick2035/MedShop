import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { AuditLog } from '@/types/audit';

export interface AuditLogListParams {
  hospitalId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const auditApi = {
  /** Query audit logs with optional filters and pagination */
  getLogs(
    params?: AuditLogListParams,
  ): Promise<PaginatedResponse<AuditLog>> {
    return client
      .get('/api/v1/audit/logs', { params })
      .then((r) => r.data as PaginatedResponse<AuditLog>);
  },
};
