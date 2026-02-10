import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { MedicalServiceRequest, MedicalServiceResponse } from '@/types/catalog';
import type { ServiceType } from '@/types/enums';

export interface MedicalServiceListParams {
  hospitalId?: string;
  categoryId?: string;
  serviceType?: ServiceType;
  page?: number;
  size?: number;
}

export const medicalServicesApi = {
  /** List medical services with optional filters and pagination */
  list(
    params?: MedicalServiceListParams,
  ): Promise<PaginatedResponse<MedicalServiceResponse>> {
    return client
      .get('/api/v1/catalog/services', { params })
      .then((r) => r.data as PaginatedResponse<MedicalServiceResponse>);
  },

  /** Create a new medical service */
  create(body: MedicalServiceRequest): Promise<MedicalServiceResponse> {
    return client
      .post('/api/v1/catalog/services', body)
      .then((r) => r.data as MedicalServiceResponse);
  },

  /** Get a single medical service by ID */
  getById(id: string): Promise<MedicalServiceResponse> {
    return client
      .get(`/api/v1/catalog/services/${id}`)
      .then((r) => r.data as MedicalServiceResponse);
  },

  /** Update an existing medical service */
  update(
    id: string,
    body: MedicalServiceRequest,
  ): Promise<MedicalServiceResponse> {
    return client
      .put(`/api/v1/catalog/services/${id}`, body)
      .then((r) => r.data as MedicalServiceResponse);
  },

  /** Delete a medical service */
  remove(id: string): Promise<void> {
    return client
      .delete(`/api/v1/catalog/services/${id}`)
      .then(() => undefined);
  },
};
