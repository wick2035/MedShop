export interface InsuranceCalculateRequest {
  orderId: string;
}

export interface InsuranceCoverageItemDetail {
  itemName: string;
  category: string;
  amount: number;
  eligibleAmount: number;
  insurancePays: number;
  patientPays: number;
}

export interface InsuranceCoverageResult {
  totalAmount: number;
  eligibleAmount: number;
  deductibleAmount: number;
  insurancePays: number;
  patientCopay: number;
  coverageRatio: number;
  itemDetails: InsuranceCoverageItemDetail[];
}

export interface InsuranceClaim {
  id: string;
  hospitalId: string;
  claimNo: string;
  orderId: string;
  patientId: string;
  insuranceType: string;
  insuranceNumber: string;
  insuranceRegion: string | null;
  totalAmount: number;
  eligibleAmount: number;
  deductibleAmount: number;
  coverageRatio: number;
  insurancePays: number;
  patientCopay: number;
  itemBreakdown: string;
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  settledAt: string | null;
  rejectionReason: string | null;
  externalClaimId: string | null;
  externalResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SplitPayRequest {
  orderId: string;
  useInsurance: boolean;
  insuranceType: string;
  insuranceNumber: string;
  insuranceRegion?: string;
  paymentChannel?: string;
}

export interface SplitDetail {
  payerType: string;
  amount: number;
  status: string;
}

export interface SplitPayResponse {
  splits: SplitDetail[];
  selfPayTransactionNo: string;
}

export interface Reimbursement {
  id: string;
  hospitalId: string;
  patientId: string;
  orderId: string;
  claimId: string | null;
  originalPaid: number;
  reimbursedAmount: number;
  status: string;
  submittedAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
