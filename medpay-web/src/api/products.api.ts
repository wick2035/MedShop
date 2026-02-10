import { client } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { ProductRequest, ProductResponse } from '@/types/catalog';
import type { ProductType } from '@/types/enums';

export interface ProductListParams {
  hospitalId?: string;
  productType?: ProductType;
  page?: number;
  size?: number;
}

export interface ProductStockAdjustRequest {
  quantity: number;
  adjustment: number;
}

export const productsApi = {
  /** List products with optional filters and pagination */
  list(params?: ProductListParams): Promise<PaginatedResponse<ProductResponse>> {
    return client
      .get('/api/v1/catalog/products', { params })
      .then((r) => r.data as PaginatedResponse<ProductResponse>);
  },

  /** Create a new product */
  create(body: ProductRequest): Promise<ProductResponse> {
    return client
      .post('/api/v1/catalog/products', body)
      .then((r) => r.data as ProductResponse);
  },

  /** Get a single product by ID */
  getById(id: string): Promise<ProductResponse> {
    return client
      .get(`/api/v1/catalog/products/${id}`)
      .then((r) => r.data as ProductResponse);
  },

  /** Update an existing product */
  update(id: string, body: ProductRequest): Promise<ProductResponse> {
    return client
      .put(`/api/v1/catalog/products/${id}`, body)
      .then((r) => r.data as ProductResponse);
  },

  /** Adjust product stock */
  adjustStock(id: string, body: ProductStockAdjustRequest): Promise<void> {
    return client
      .put(`/api/v1/catalog/products/${id}/stock`, body)
      .then(() => undefined);
  },
};
