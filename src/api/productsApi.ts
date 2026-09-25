import axiosClient from './axiosClient';
import {
  CategoryItem,
  Product,
  ProductFormData,
  ProductsResponse,
} from '../types/product';
import { ProductQueryParams } from '../types/query';

export const productsApi = {
  /**
   * Fetch products with pagination, search, category filter, and sorting.
   * Supports AbortSignal for race condition avoidance.
   */
  getProducts: async (
    params: ProductQueryParams,
    signal?: AbortSignal
  ): Promise<ProductsResponse> => {
    const { page, limit, q, category, sortBy, order, delay } = params;
    const skip = Math.max(0, (page - 1) * limit);

    // Build URL query parameters
    const queryParams: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }
    if (order) {
      queryParams.order = order;
    }
    if (delay && delay > 0) {
      queryParams.delay = delay;
    }

    let endpoint = '/products';

    // DummyJSON API constraint:
    // /products/search?q= does NOT accept category filtering
    // /products/category/:category does NOT accept search query q
    if (q && q.trim().length > 0) {
      endpoint = '/products/search';
      queryParams.q = q.trim();
    } else if (category && category.trim().length > 0 && category !== 'all') {
      endpoint = `/products/category/${encodeURIComponent(category.trim())}`;
    }

    const response = await axiosClient.get<ProductsResponse>(endpoint, {
      params: queryParams,
      signal,
    });

    return response.data;
  },

  /**
   * Fetch a single product by ID (GET /products/{id})
   */
  getProductById: async (id: number | string, delay?: number): Promise<Product> => {
    const params = delay && delay > 0 ? { delay } : undefined;
    const response = await axiosClient.get<Product>(`/products/${id}`, { params });
    return response.data;
  },

  /**
   * Fetch all product categories (GET /products/categories)
   */
  getCategories: async (): Promise<CategoryItem[]> => {
    const response = await axiosClient.get<CategoryItem[] | string[]>('/products/categories');
    const rawData = response.data;

    // Handle both DummyJSON v2 (objects with slug & name) and older string[] responses
    if (Array.isArray(rawData)) {
      return rawData.map((item) => {
        if (typeof item === 'string') {
          return {
            slug: item,
            name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '),
            url: `https://dummyjson.com/products/category/${item}`,
          };
        }
        return item as CategoryItem;
      });
    }
    return [];
  },

  /**
   * Add a new product (POST /products/add)
   * Note: DummyJSON simulates adding and returns new product with new ID
   */
  addProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await axiosClient.post<Product>('/products/add', data);
    return response.data;
  },

  /**
   * Update an existing product (PUT /products/{id})
   * Note: DummyJSON simulates updating and returns modified product
   */
  updateProduct: async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await axiosClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product (DELETE /products/{id})
   * Note: DummyJSON simulates deletion and returns { id, isDeleted, deletedOn }
   */
  deleteProduct: async (id: number): Promise<{ id: number; isDeleted: boolean }> => {
    const response = await axiosClient.delete<{ id: number; isDeleted: boolean }>(
      `/products/${id}`
    );
    return response.data;
  },
};
