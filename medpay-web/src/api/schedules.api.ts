import { client, unwrapPage } from './client';
import type {
  DoctorScheduleRequest,
  DoctorScheduleResponse,
} from '@/types/schedule';

export interface ScheduleListParams {
  doctorId?: string;
  departmentId?: string;
  date?: string;
  hospitalId?: string;
}

export const schedulesApi = {
  /** List doctor schedules with optional filters */
  list(params?: ScheduleListParams): Promise<DoctorScheduleResponse[]> {
    return client
      .get('/api/v1/schedules', { params })
      .then((r) => unwrapPage<DoctorScheduleResponse>(r.data));
  },

  /** Get a single schedule by ID */
  getById(id: string): Promise<DoctorScheduleResponse> {
    return client
      .get(`/api/v1/schedules/${id}`)
      .then((r) => r.data as DoctorScheduleResponse);
  },

  /** Create a new doctor schedule */
  create(body: DoctorScheduleRequest): Promise<DoctorScheduleResponse> {
    return client
      .post('/api/v1/schedules', body)
      .then((r) => r.data as DoctorScheduleResponse);
  },

  /** Update an existing schedule */
  update(
    id: string,
    body: DoctorScheduleRequest,
  ): Promise<DoctorScheduleResponse> {
    return client
      .put(`/api/v1/schedules/${id}`, body)
      .then((r) => r.data as DoctorScheduleResponse);
  },

  /** Delete a schedule */
  remove(id: string): Promise<void> {
    return client.delete(`/api/v1/schedules/${id}`).then(() => undefined);
  },
};
