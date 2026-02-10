import type { OrderType, ItemType, OrderStatus, OrderSource } from './enums';

export interface OrderItemRequest {
  itemType: ItemType;
  referenceId: string;
  quantity: number;
}

export interface AppointmentInfo {
  scheduleId: string;
  appointmentDate: string;
}

export interface DeliveryInfo {
  type: string;
  address: string;
}

export interface OrderCreateRequest {
  orderType: OrderType;
  items: OrderItemRequest[];
  appointmentInfo?: AppointmentInfo;
  deliveryInfo?: DeliveryInfo;
  couponCode?: string;
  remark?: string;
}

export interface AppointmentOrderRequest {
  scheduleId: string;
  doctorId?: string;
}

export interface OrderItemResponse {
  id: string;
  itemType: ItemType;
  referenceId: string;
  name: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  insuranceAmount: number;
  selfPayAmount: number;
}

export interface OrderResponse {
  id: string;
  orderNo: string;
  patientId: string;
  doctorId: string | null;
  orderType: OrderType;
  orderSource: OrderSource;
  totalAmount: number;
  discountAmount: number;
  insuranceAmount: number;
  selfPayAmount: number;
  status: OrderStatus;
  items: OrderItemResponse[];
  paidAt: string | null;
  completedAt: string | null;
  cancelReason: string | null;
  expireAt: string | null;
  appointmentDate: string | null;
  appointmentTimeStart: string | null;
  appointmentTimeEnd: string | null;
  deliveryType: string | null;
  deliveryAddress: string | null;
  remark: string | null;
  createdAt: string;
}
