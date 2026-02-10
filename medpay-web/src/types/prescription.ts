export interface PrescriptionItemRequest {
  productId: string;
  quantity: number;
  dosageInstruction?: string;
  frequency?: string;
  durationDays?: number;
}

export interface PrescriptionCreateRequest {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  diagnosisCode?: string;
  notes?: string;
  items: PrescriptionItemRequest[];
}

export interface PrescriptionItemResponse {
  id: string;
  productId: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  dosageInstruction: string;
  frequency: string;
  durationDays: number | null;
  insuranceCovered: boolean;
  insuranceRatio: number;
}

export interface PrescriptionResponse {
  id: string;
  prescriptionNo: string;
  doctorId: string;
  patientId: string;
  appointmentId: string | null;
  diagnosis: string;
  diagnosisCode: string | null;
  notes: string | null;
  totalAmount: number;
  insuranceAmount: number;
  selfPayAmount: number;
  status: string;
  validUntil: string;
  createdAt: string;
  items: PrescriptionItemResponse[];
}
