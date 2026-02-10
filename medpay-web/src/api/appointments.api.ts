import { client } from './client';

export const appointmentsApi = {
  /** Check in a patient for their appointment */
  checkIn(id: string): Promise<void> {
    return client
      .put(`/api/v1/appointments/${id}/check-in`)
      .then(() => undefined);
  },
};
