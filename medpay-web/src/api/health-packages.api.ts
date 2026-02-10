import { client, unwrapPage } from './client';
import type {
  HealthPackageRequest,
  HealthPackageResponse,
} from '@/types/health-package';
import type { PackageType } from '@/types/enums';

export interface HealthPackageListParams {
  hospitalId?: string;
  packageType?: PackageType;
}

export const healthPackagesApi = {
  /** List health packages with optional filters */
  list(params?: HealthPackageListParams): Promise<HealthPackageResponse[]> {
    return client
      .get('/api/v1/catalog/packages', { params })
      .then((r) => unwrapPage<HealthPackageResponse>(r.data));
  },

  /** Create a new health package */
  create(body: HealthPackageRequest): Promise<HealthPackageResponse> {
    return client
      .post('/api/v1/catalog/packages', body)
      .then((r) => r.data as HealthPackageResponse);
  },

  /** Get a single health package by ID */
  getById(id: string): Promise<HealthPackageResponse> {
    return client
      .get(`/api/v1/catalog/packages/${id}`)
      .then((r) => r.data as HealthPackageResponse);
  },

  /** Update an existing health package */
  update(
    id: string,
    body: HealthPackageRequest,
  ): Promise<HealthPackageResponse> {
    return client
      .put(`/api/v1/catalog/packages/${id}`, body)
      .then((r) => r.data as HealthPackageResponse);
  },
};
