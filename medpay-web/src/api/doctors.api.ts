import { client } from './client';
import type { DoctorResponse } from '@/types/doctor';

export interface DoctorListParams {
  hospitalId?: string;
  departmentId?: string;
}

export const doctorsApi = {
  /** List doctors, optionally filtered by hospital and/or department */
  list(params?: DoctorListParams): Promise<DoctorResponse[]> {
    return client
      .get('/api/v1/doctors', { params })
      .then((r) => {
        const data = r.data as any;
        // Backend returns Page<T> — extract content array
        return (data?.content ?? data ?? []) as DoctorResponse[];
      });
  },

  /** Get a single doctor by ID */
  getById(id: string): Promise<DoctorResponse> {
    return client
      .get(`/api/v1/doctors/${id}`)
      .then((r) => r.data as DoctorResponse);
  },
};
