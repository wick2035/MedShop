export interface DoctorScheduleRequest {
  doctorId: string;
  serviceId?: string;
  scheduleDate: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  maxPatients: number;
}

export interface DoctorScheduleResponse {
  id: string;
  doctorId: string;
  serviceId: string | null;
  scheduleDate: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  maxPatients: number;
  bookedCount: number;
  status: string;
  createdAt: string;
}
