import type { HospitalStatus, SubscriptionTier } from './enums';

export interface HospitalCreateRequest {
  name: string;
  code: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  province?: string;
  contactPhone?: string;
  contactEmail?: string;
  logoUrl?: string;
  timezone?: string;
}

export interface HospitalUpdateRequest {
  name?: string;
  licenseNumber?: string;
  address?: string;
  city?: string;
  province?: string;
  contactPhone?: string;
  contactEmail?: string;
  logoUrl?: string;
  timezone?: string;
}

export interface HospitalResponse {
  id: string;
  name: string;
  code: string;
  licenseNumber: string;
  address: string;
  city: string;
  province: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl: string;
  status: HospitalStatus;
  subscriptionTier: SubscriptionTier;
  configJson: Record<string, unknown>;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRequest {
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  sortOrder?: number;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  description: string;
  sortOrder: number;
  status: string;
  children: DepartmentResponse[];
}
