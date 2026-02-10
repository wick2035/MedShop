import { client, unwrapPage } from './client';
import type {
  PrescriptionCreateRequest,
  PrescriptionResponse,
} from '@/types/prescription';
import type { OrderResponse } from '@/types/order';

export const prescriptionsApi = {
  /** Create a new prescription */
  create(body: PrescriptionCreateRequest): Promise<PrescriptionResponse> {
    return client
      .post('/api/v1/prescriptions', body)
      .then((r) => r.data as PrescriptionResponse);
  },

  /** Get a single prescription by ID */
  getById(id: string): Promise<PrescriptionResponse> {
    return client
      .get(`/api/v1/prescriptions/${id}`)
      .then((r) => r.data as PrescriptionResponse);
  },

  /** List prescriptions by patient ID */
  listByPatient(patientId: string): Promise<PrescriptionResponse[]> {
    return client
      .get('/api/v1/prescriptions', { params: { patientId } })
      .then((r) => unwrapPage<PrescriptionResponse>(r.data));
  },

  /** List prescriptions by doctor ID */
  listByDoctor(doctorId: string): Promise<PrescriptionResponse[]> {
    return client
      .get('/api/v1/prescriptions', { params: { doctorId } })
      .then((r) => unwrapPage<PrescriptionResponse>(r.data));
  },

  /** Confirm a pending prescription */
  confirm(id: string): Promise<PrescriptionResponse> {
    return client
      .put(`/api/v1/prescriptions/${id}/confirm`)
      .then((r) => r.data as PrescriptionResponse);
  },

  /** Cancel a prescription */
  cancel(id: string): Promise<void> {
    return client
      .put(`/api/v1/prescriptions/${id}/cancel`)
      .then(() => undefined);
  },

  /** Convert a prescription into an order */
  createOrder(id: string): Promise<OrderResponse> {
    return client
      .post(`/api/v1/prescriptions/${id}/order`)
      .then((r) => r.data as OrderResponse);
  },
};
