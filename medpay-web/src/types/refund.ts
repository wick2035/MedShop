export interface RefundCreateRequest {
  orderId: string;
  refundType: string;
  refundAmount: number;
  refundReason: string;
}

export interface RefundResponse {
  id: string;
  refundNo: string;
  orderNo: string;
  status: string;
  refundAmount: number;
  refundType: string;
  refundReason: string;
  reviewComment: string | null;
  reviewedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface RefundApprovalRequest {
  comment: string;
}
