export interface DashboardKpiResponse {
  todayRevenue: number;
  todayOrders: number;
  todayRefunds: number;
  pendingRefunds: number;
  monthRevenue: number;
  monthOrders: number;
  monthRefunds: number;
  settlementPending: number;
}

export interface SettlementGenerateRequest {
  hospitalId: string;
  periodStart: string;
  periodEnd: string;
}

export interface SettlementRecord {
  id: string;
  hospitalId: string;
  settlementNo: string;
  settlementPeriodStart: string;
  settlementPeriodEnd: string;
  totalTransactions: number;
  grossAmount: number;
  refundAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  settledAt: string | null;
  bankAccountInfo: string | null;
  createdAt: string;
  updatedAt: string;
}
