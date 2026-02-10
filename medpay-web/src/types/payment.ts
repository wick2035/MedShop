import type { PaymentChannel, PaymentStatus } from './enums';

export interface PaymentInitiateRequest {
  orderId: string;
  paymentChannel: PaymentChannel;
}

export interface PaymentInitiateResponse {
  transactionNo: string;
  payUrl: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
  transactionNo: string;
  status: PaymentStatus;
  totalAmount: number;
  paymentChannel: PaymentChannel;
  paidAt: string | null;
  createdAt: string;
}

export interface LedgerResponse {
  ledgerNo: string;
  transactionType: string;
  direction: string;
  referenceType: string;
  amount: number;
  description: string;
  createdAt: string;
}
