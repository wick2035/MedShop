import type { AppointmentResponse } from '@/types/appointment';
import { client } from './client';

export const appointmentsApi = {
  /** List appointments for a doctor on a given date */
  list(params: { doctorId: string; date: string }): Promise<AppointmentResponse[]> {
    return client
      .get<AppointmentResponse[]>('/api/v1/appointments', { params })
      .then((r) => r.data);
  },

  /** Get a single appointment by ID */
  getById(id: string): Promise<AppointmentResponse> {
    return client
      .get<AppointmentResponse>(`/api/v1/appointments/${id}`)
      .then((r) => r.data);
  },

  /** Check in a patient for their appointment */
  checkIn(id: string): Promise<void> {
    return client
      .put(`/api/v1/appointments/${id}/check-in`)
      .then(() => undefined);
  },

  /** Start consultation for a checked-in appointment */
  startConsultation(id: string): Promise<void> {
    return client
      .put(`/api/v1/appointments/${id}/start`)
      .then(() => undefined);
  },

  /** Complete an in-progress appointment */
  complete(id: string): Promise<void> {
    return client
      .put(`/api/v1/appointments/${id}/complete`)
      .then(() => undefined);
  },
};
