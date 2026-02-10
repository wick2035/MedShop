import { client } from './client';
import type {
  DepartmentRequest,
  DepartmentResponse,
} from '@/types/hospital';

export const departmentsApi = {
  /** List all departments for a hospital */
  list(hospitalId: string): Promise<DepartmentResponse[]> {
    return client
      .get(`/api/v1/hospitals/${hospitalId}/departments`)
      .then((r) => r.data as DepartmentResponse[]);
  },

  /** Create a new department under a hospital */
  create(
    hospitalId: string,
    body: DepartmentRequest,
  ): Promise<DepartmentResponse> {
    return client
      .post(`/api/v1/hospitals/${hospitalId}/departments`, body)
      .then((r) => r.data as DepartmentResponse);
  },

  /** Update an existing department */
  update(
    hospitalId: string,
    id: string,
    body: DepartmentRequest,
  ): Promise<DepartmentResponse> {
    return client
      .put(`/api/v1/hospitals/${hospitalId}/departments/${id}`, body)
      .then((r) => r.data as DepartmentResponse);
  },

  /** Delete a department */
  remove(hospitalId: string, id: string): Promise<void> {
    return client
      .delete(`/api/v1/hospitals/${hospitalId}/departments/${id}`)
      .then(() => undefined);
  },
};
