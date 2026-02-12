import { client } from './client';
import type {
  ServiceCategoryRequest,
  ServiceCategoryResponse,
} from '@/types/catalog';

export const catalogCategoriesApi = {
  /** List all service categories */
  list(hospitalId?: string): Promise<ServiceCategoryResponse[]> {
    return client
      .get('/api/v1/catalog/categories', {
        params: hospitalId ? { hospitalId } : undefined,
      })
      .then((r) => r.data as ServiceCategoryResponse[]);
  },

  /** Create a new service category */
  create(body: ServiceCategoryRequest): Promise<ServiceCategoryResponse> {
    return client
      .post('/api/v1/catalog/categories', body)
      .then((r) => r.data as ServiceCategoryResponse);
  },

  /** Update an existing service category */
  update(
    id: string,
    body: ServiceCategoryRequest,
  ): Promise<ServiceCategoryResponse> {
    return client
      .put(`/api/v1/catalog/categories/${id}`, body)
      .then((r) => r.data as ServiceCategoryResponse);
  },
};
