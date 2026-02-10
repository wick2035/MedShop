import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符'),
  phone: z.string().min(1, '请输入手机号'),
  password: z.string().min(6, '密码至少6位'),
  fullName: z.string().min(1, '请输入姓名'),
  gender: z.string().optional(),
  email: z
    .string()
    .email('请输入有效邮箱')
    .optional()
    .or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Hospital schema
// ---------------------------------------------------------------------------

export const hospitalSchema = z.object({
  name: z.string().min(1, '请输入医院名称'),
  address: z.string().min(1, '请输入医院地址'),
  phone: z.string().min(1, '请输入联系电话'),
  description: z.string().optional(),
  logoUrl: z.string().url('请输入有效的Logo链接').optional().or(z.literal('')),
  subscriptionTier: z.string().min(1, '请选择订阅等级'),
  status: z.string().optional(),
});

export type HospitalFormValues = z.infer<typeof hospitalSchema>;

// ---------------------------------------------------------------------------
// Department schema
// ---------------------------------------------------------------------------

export const departmentSchema = z.object({
  name: z.string().min(1, '请输入科室名称'),
  description: z.string().optional(),
  hospitalId: z.string().min(1, '请选择所属医院'),
  sortOrder: z.coerce.number().int('排序必须为整数').min(0, '排序不能为负数').optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

// ---------------------------------------------------------------------------
// Medical Service schema
// ---------------------------------------------------------------------------

export const medicalServiceSchema = z.object({
  name: z.string().min(1, '请输入服务名称'),
  description: z.string().optional(),
  serviceType: z.string().min(1, '请选择服务类型'),
  hospitalId: z.string().min(1, '请选择所属医院'),
  departmentId: z.string().optional(),
  price: z.coerce.number().min(0.01, '价格必须大于0'),
  durationMinutes: z.coerce
    .number()
    .int('时长必须为整数')
    .min(1, '时长至少1分钟')
    .optional(),
  isActive: z.boolean().optional(),
});

export type MedicalServiceFormValues = z.infer<typeof medicalServiceSchema>;

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  name: z.string().min(1, '请输入商品名称'),
  description: z.string().optional(),
  productType: z.string().min(1, '请选择商品类型'),
  hospitalId: z.string().min(1, '请选择所属医院'),
  price: z.coerce.number().min(0.01, '价格必须大于0'),
  stock: z.coerce.number().int('库存必须为整数').min(0, '库存不能为负数'),
  unit: z.string().min(1, '请输入单位'),
  manufacturer: z.string().optional(),
  approvalNumber: z.string().optional(),
  imageUrl: z.string().url('请输入有效的图片链接').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ---------------------------------------------------------------------------
// Schedule schema
// ---------------------------------------------------------------------------

export const scheduleSchema = z.object({
  doctorId: z.string().min(1, '请选择医生'),
  departmentId: z.string().min(1, '请选择科室'),
  hospitalId: z.string().min(1, '请选择医院'),
  date: z.string().min(1, '请选择日期'),
  startTime: z.string().min(1, '请选择开始时间'),
  endTime: z.string().min(1, '请选择结束时间'),
  maxAppointments: z.coerce
    .number()
    .int('最大预约数必须为整数')
    .min(1, '至少允许1个预约'),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// ---------------------------------------------------------------------------
// Prescription schema
// ---------------------------------------------------------------------------

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, '请选择患者'),
  doctorId: z.string().min(1, '请选择医生'),
  hospitalId: z.string().min(1, '请选择医院'),
  diagnosis: z.string().min(1, '请输入诊断信息'),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '请选择药品'),
        quantity: z.coerce.number().int('数量必须为整数').min(1, '数量至少为1'),
        dosage: z.string().min(1, '请输入用法用量'),
        frequency: z.string().min(1, '请输入使用频率'),
        duration: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1, '至少需要一项处方药品'),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// ---------------------------------------------------------------------------
// Health Package schema
// ---------------------------------------------------------------------------

export const healthPackageSchema = z.object({
  name: z.string().min(1, '请输入套餐名称'),
  description: z.string().optional(),
  packageType: z.string().min(1, '请选择套餐类型'),
  hospitalId: z.string().min(1, '请选择所属医院'),
  originalPrice: z.coerce.number().min(0.01, '原价必须大于0'),
  discountPrice: z.coerce.number().min(0.01, '优惠价必须大于0'),
  imageUrl: z.string().url('请输入有效的图片链接').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
});

export type HealthPackageFormValues = z.infer<typeof healthPackageSchema>;

// ---------------------------------------------------------------------------
// Refund schema
// ---------------------------------------------------------------------------

export const refundSchema = z.object({
  orderId: z.string().min(1, '请选择订单'),
  reason: z.string().min(1, '请输入退款原因'),
  amount: z.coerce.number().min(0.01, '退款金额必须大于0'),
  isPartial: z.boolean().optional(),
});

export type RefundFormValues = z.infer<typeof refundSchema>;

// ---------------------------------------------------------------------------
// Reconciliation Trigger schema
// ---------------------------------------------------------------------------

export const reconciliationTriggerSchema = z.object({
  hospitalId: z.string().min(1, '请选择医院'),
  channel: z.string().min(1, '请选择支付渠道'),
  reconciliationDate: z.string().min(1, '请选择对账日期'),
});

export type ReconciliationTriggerFormValues = z.infer<typeof reconciliationTriggerSchema>;

// ---------------------------------------------------------------------------
// Settlement schema
// ---------------------------------------------------------------------------

export const settlementSchema = z.object({
  hospitalId: z.string().min(1, '请选择医院'),
  startDate: z.string().min(1, '请选择开始日期'),
  endDate: z.string().min(1, '请选择结束日期'),
  notes: z.string().optional(),
});

export type SettlementFormValues = z.infer<typeof settlementSchema>;
