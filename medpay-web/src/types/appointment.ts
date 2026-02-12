import type { AppointmentStatus } from './enums';

export interface AppointmentResponse {
  id: string;
  appointmentNo: string;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  orderId: string;
  appointmentDate: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  queueNumber: number;
  status: AppointmentStatus;
  checkInTime: string | null;
  createdAt: string;
}
