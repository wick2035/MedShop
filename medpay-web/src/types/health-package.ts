import type { PackageType } from './enums';

export interface HealthPackageIncludedItem {
  [key: string]: unknown;
}

export interface HealthPackageRequest {
  name: string;
  code: string;
  description?: string;
  packageType: PackageType;
  price: number;
  originalPrice?: number;
  validityDays?: number;
  maxUsage?: number;
  includedItems?: HealthPackageIncludedItem[];
  imageUrl?: string;
  sortOrder?: number;
}

export interface HealthPackageResponse {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  description: string | null;
  packageType: PackageType;
  price: number;
  originalPrice: number | null;
  validityDays: number | null;
  maxUsage: number | null;
  includedItems: HealthPackageIncludedItem[];
  imageUrl: string | null;
  sortOrder: number;
  status: string;
  createdAt: string;
}
