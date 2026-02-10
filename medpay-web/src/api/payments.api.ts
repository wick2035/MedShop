import { client } from './client';
import type {
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from '@/types/payment';
import type {
  SplitPayRequest,
  SplitPayResponse,
} from '@/types/insurance';

export const paymentsApi = {
  /** Initiate a payment for an order */
  initiate(body: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return client
      .post('/api/v1/payments/initiate', body)
      .then((r) => r.data as PaymentInitiateResponse);
  },

  /** Query the current status of a payment by transaction number */
  getStatus(transactionNo: string): Promise<PaymentStatusResponse> {
    return client
      .get(`/api/v1/payments/${transactionNo}`)
      .then((r) => r.data as PaymentStatusResponse);
  },

  /** Initiate a split payment (e.g. insurance + self-pay) */
  splitPay(body: SplitPayRequest): Promise<SplitPayResponse> {
    return client
      .post('/api/v1/payments/split-pay', body)
      .then((r) => r.data as SplitPayResponse);
  },

  /** Get split payment details for an order */
  getSplits(orderId: string): Promise<SplitPayResponse[]> {
    return client
      .get(`/api/v1/payments/${orderId}/splits`)
      .then((r) => r.data as SplitPayResponse[]);
  },
};
