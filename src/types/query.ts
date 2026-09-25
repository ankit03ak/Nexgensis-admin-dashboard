export type SortField = 'price' | 'rating' | 'title' | 'stock' | 'id';
export type SortOrder = 'asc' | 'desc';

export interface ProductQueryParams {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number; // For testing race conditions (&delay=2000)
}
