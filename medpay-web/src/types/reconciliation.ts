export interface ReconciliationTriggerRequest {
  reconciliationDate: string;
  channel: string;
  hospitalId: string;
}

export interface ReconciliationBatchResponse {
  id: string;
  batchNo: string;
  reconciliationDate: string;
  channel: string;
  systemTransactionCount: number;
  channelTransactionCount: number;
  matchedCount: number;
  mismatchedCount: number;
  missingInSystem: number;
  missingInChannel: number;
  systemTotalAmount: number;
  channelTotalAmount: number;
  differenceAmount: number;
  status: string;
  completedAt: string | null;
}

export interface ReconciliationDetail {
  id: string;
  batchId: string;
  paymentTransactionId: string | null;
  channelTransactionId: string | null;
  systemAmount: number | null;
  channelAmount: number | null;
  matchStatus: string;
  resolutionStatus: string;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ReconciliationResolveRequest {
  resolutionNote: string;
}
