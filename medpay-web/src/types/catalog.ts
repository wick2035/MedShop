import type { ServiceType, ProductType } from './enums';

/* ── Service Categories ─────────────────────────────────── */

export interface ServiceCategoryRequest {
  name: string;
  code: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface ServiceCategoryResponse {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  iconUrl: string;
  sortOrder: number;
  status: string;
  children: ServiceCategoryResponse[];
}

/* ── Medical Services ───────────────────────────────────── */

export interface MedicalServiceRequest {
  categoryId?: string;
  departmentId?: string;
  name: string;
  code: string;
  serviceType: ServiceType;
  description?: string;
  price: number;
  originalPrice?: number;
  insuranceCovered: boolean;
  insuranceCategory?: string;
  insuranceRatio?: number;
  maxDailyQuota?: number;
  durationMinutes?: number;
  requiresPrescription: boolean;
  imageUrls?: string[];
  tags?: string[];
  sortOrder?: number;
}

export interface MedicalServiceResponse {
  id: string;
  hospitalId: string;
  categoryId: string | null;
  departmentId: string | null;
  name: string;
  code: string;
  serviceType: ServiceType;
  description: string;
  price: number;
  originalPrice: number | null;
  insuranceCovered: boolean;
  insuranceCategory: string | null;
  insuranceRatio: number | null;
  maxDailyQuota: number | null;
  durationMinutes: number | null;
  requiresPrescription: boolean;
  imageUrls: string[];
  tags: string[];
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Products ───────────────────────────────────────────── */

export interface ProductRequest {
  categoryId?: string;
  name: string;
  code: string;
  productType: ProductType;
  genericName?: string;
  manufacturer?: string;
  specification?: string;
  unit?: string;
  price: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  requiresPrescription: boolean;
  insuranceCovered: boolean;
  insuranceCategory?: string;
  insuranceRatio?: number;
  contraindications?: string;
  sideEffects?: string;
  storageConditions?: string;
  expiryWarningDays?: number;
  imageUrls?: string[];
  barcode?: string;
}

export interface ProductResponse {
  id: string;
  hospitalId: string;
  categoryId: string | null;
  name: string;
  code: string;
  productType: ProductType;
  genericName: string | null;
  manufacturer: string | null;
  specification: string | null;
  unit: string | null;
  price: number;
  costPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  requiresPrescription: boolean;
  insuranceCovered: boolean;
  insuranceCategory: string | null;
  insuranceRatio: number | null;
  contraindications: string | null;
  sideEffects: string | null;
  storageConditions: string | null;
  expiryWarningDays: number | null;
  imageUrls: string[];
  barcode: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
