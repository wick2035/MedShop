import type { OrderStatus, OrderType, PaymentStatus, PaymentChannel, UserRole, ProductType, ServiceType, PackageType, HospitalStatus, AppointmentStatus } from '@/types/enums';

// ---------------------------------------------------------------------------
// Chinese label maps
// ---------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: '待创建',
  PENDING_PAYMENT: '待支付',
  PAYING: '支付中',
  PAID: '已支付',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUND_REQUESTED: '退款申请中',
  REFUND_APPROVED: '退款已批准',
  REFUNDED: '已退款',
  PARTIAL_REFUND_REQUESTED: '部分退款申请中',
  PARTIAL_REFUND_APPROVED: '部分退款已批准',
  PARTIALLY_REFUNDED: '部分已退款',
  CLOSED: '已关闭',
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  REGISTRATION: '挂号',
  MEDICINE: '购药',
  PRODUCT: '商品',
  SERVICE: '服务',
  PACKAGE: '套餐',
  EXAMINATION: '检查',
  INPATIENT_DEPOSIT: '住院押金',
  REHABILITATION: '康复',
  HOME_CARE: '家庭护理',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: '待支付',
  PROCESSING: '处理中',
  SUCCESS: '支付成功',
  FAILED: '支付失败',
  EXPIRED: '已过期',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  SETTLED: '已结算',
};

export const PAYMENT_CHANNEL_LABELS: Record<PaymentChannel, string> = {
  WECHAT: '微信支付',
  ALIPAY: '支付宝',
  UNIONPAY: '银联',
  BANK_CARD: '银行卡',
  MOCK: '模拟支付',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PATIENT: '患者',
  DOCTOR: '医生',
  HOSPITAL_ADMIN: '医院管理员',
  SUPER_ADMIN: '超级管理员',
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  MEDICINE: '药品',
  MEDICAL_DEVICE: '医疗器械',
  HEALTH_PRODUCT: '健康产品',
  SUPPLEMENT: '保健品',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  REGISTRATION: '挂号',
  EXAMINATION: '检查',
  CONSULTATION: '咨询',
  TELEMEDICINE: '远程医疗',
  VIP_PACKAGE: 'VIP套餐',
  HEALTH_CHECKUP: '体检',
  SECOND_OPINION: '会诊',
  REHABILITATION: '康复',
};

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  HEALTH_CHECKUP: '体检套餐',
  VIP_CARE: 'VIP护理',
  CHRONIC_MANAGEMENT: '慢病管理',
  MATERNITY: '产检套餐',
};

export const HOSPITAL_STATUS_LABELS: Record<HospitalStatus, string> = {
  ACTIVE: '正常',
  SUSPENDED: '已暂停',
  DEACTIVATED: '已停用',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  BOOKED: '已预约',
  CHECKED_IN: '已签到',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  NO_SHOW: '未到诊',
  CANCELLED: '已取消',
};

// ---------------------------------------------------------------------------
// Color maps (Tailwind CSS classes)
// ---------------------------------------------------------------------------

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700',
  PAYING: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REFUND_REQUESTED: 'bg-orange-50 text-orange-700',
  REFUND_APPROVED: 'bg-orange-50 text-orange-700',
  REFUNDED: 'bg-red-50 text-red-700',
  PARTIAL_REFUND_REQUESTED: 'bg-orange-50 text-orange-700',
  PARTIAL_REFUND_APPROVED: 'bg-orange-50 text-orange-700',
  PARTIALLY_REFUNDED: 'bg-red-50 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-500',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-red-50 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  REFUNDING: 'bg-orange-50 text-orange-700',
  REFUNDED: 'bg-red-50 text-red-700',
  SETTLED: 'bg-emerald-50 text-emerald-700',
};

export const HOSPITAL_STATUS_COLORS: Record<HospitalStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  SUSPENDED: 'bg-amber-50 text-amber-700',
  DEACTIVATED: 'bg-red-50 text-red-700',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  BOOKED: 'bg-blue-50 text-blue-700',
  CHECKED_IN: 'bg-emerald-50 text-emerald-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  NO_SHOW: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};
