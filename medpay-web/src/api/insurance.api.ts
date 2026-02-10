import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type {
  InsuranceCalculateRequest,
  InsuranceCoverageResult,
  InsuranceClaim,
  Reimbursement,
} from '@/types/insurance';

export interface InsuranceClaimListParams {
  hospitalId?: string;
  page?: number;
  size?: number;
}

export const insuranceApi = {
  /** Calculate insurance coverage for an order */
  calculate(body: InsuranceCalculateRequest): Promise<InsuranceCoverageResult> {
    return client
      .post('/api/v1/insurance/calculate', body)
      .then((r) => r.data as InsuranceCoverageResult);
  },

  /** List insurance claims with optional filters and pagination */
  getClaims(
    params?: InsuranceClaimListParams,
  ): Promise<PaginatedResponse<InsuranceClaim>> {
    return client
      .get('/api/v1/insurance/claims', { params })
      .then((r) => r.data as PaginatedResponse<InsuranceClaim>);
  },

  /** List reimbursements with optional filters and pagination */
  getReimbursements(
    params?: InsuranceClaimListParams,
  ): Promise<PaginatedResponse<Reimbursement>> {
    return client
      .get('/api/v1/insurance/reimbursements', { params })
      .then((r) => r.data as PaginatedResponse<Reimbursement>);
  },
};
