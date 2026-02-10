import { client } from './client';
import type {
  HospitalCreateRequest,
  HospitalUpdateRequest,
  HospitalResponse,
} from '@/types/hospital';
import type { HospitalStatus } from '@/types/enums';

export const hospitalsApi = {
  /** Create a new hospital */
  create(body: HospitalCreateRequest): Promise<HospitalResponse> {
    return client
      .post('/api/v1/hospitals', body)
      .then((r) => r.data as HospitalResponse);
  },

  /** List all hospitals */
  list(): Promise<HospitalResponse[]> {
    return client
      .get('/api/v1/hospitals')
      .then((r) => {
        const data = r.data as any;
        // Backend returns Page<T> — extract content array
        return (data?.content ?? data ?? []) as HospitalResponse[];
      });
  },

  /** Get a single hospital by ID */
  getById(id: string): Promise<HospitalResponse> {
    return client
      .get(`/api/v1/hospitals/${id}`)
      .then((r) => r.data as HospitalResponse);
  },

  /** Update hospital details */
  update(id: string, body: HospitalUpdateRequest): Promise<HospitalResponse> {
    return client
      .put(`/api/v1/hospitals/${id}`, body)
      .then((r) => r.data as HospitalResponse);
  },

  /** Update hospital status (activate / suspend / deactivate) */
  updateStatus(id: string, status: HospitalStatus): Promise<void> {
    return client
      .put(`/api/v1/hospitals/${id}/status`, null, { params: { status } })
      .then(() => undefined);
  },

  /** Update hospital configuration */
  updateConfig(id: string, config: Record<string, unknown>): Promise<void> {
    return client
      .put(`/api/v1/hospitals/${id}/config`, config)
      .then(() => undefined);
  },
};
