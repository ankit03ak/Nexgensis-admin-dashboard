import { useState, useEffect, useCallback } from 'react';
import { SortField, SortOrder } from '../types/query';

export interface UrlState {
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number;
  view: 'table' | 'detail';
  productId?: number;
}

const VALID_LIMITS = [10, 20, 50];
const VALID_SORT_FIELDS: SortField[] = ['price', 'rating', 'title', 'stock', 'id'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export function parseUrlParams(): UrlState {
  const searchParams = new URLSearchParams(window.location.search);

  // Safe page parsing (handles ?page=abc or ?page=-5)
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // Safe limit parsing (must be 10, 20, or 50)
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const limit = VALID_LIMITS.includes(rawLimit) ? rawLimit : 10;

  // Search query
  const q = searchParams.get('q') || '';

  // Category
  const category = searchParams.get('category') || '';

  // Sort By
  const rawSortBy = searchParams.get('sortBy') as SortField | null;
  const sortBy = rawSortBy && VALID_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : undefined;

  // Order
  const rawOrder = searchParams.get('order') as SortOrder | null;
  const order = rawOrder && VALID_SORT_ORDERS.includes(rawOrder) ? rawOrder : 'asc';

  // Simulated Delay (&delay=2000)
  const rawDelay = parseInt(searchParams.get('delay') || '0', 10);
  const delay = Number.isInteger(rawDelay) && rawDelay > 0 ? rawDelay : undefined;

  // Check pathname for /products/[id] pattern (per assignment requirement: "page at /products/[id]")
  const path = window.location.pathname;
  const productMatch = path.match(/^\/products\/([^/?#]+)/i);

  let view: 'table' | 'detail' = 'table';
  let productId: number | undefined = undefined;

  if (productMatch) {
    view = 'detail';
    const parsedId = parseInt(productMatch[1], 10);
    productId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : -1;
  } else {
    // Fallback: View state & Product ID from query parameters
    const rawView = searchParams.get('view');
    const rawId = parseInt(searchParams.get('id') || '', 10);
    if (rawView === 'detail') {
      view = 'detail';
      productId = Number.isInteger(rawId) && rawId > 0 ? rawId : -1;
    }
  }

  return {
    page,
    limit,
    q,
    category,
    sortBy,
    order,
    delay,
    view,
    productId,
  };
}

export function useUrlParams() {
  const [params, setParams] = useState<UrlState>(() => parseUrlParams());

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setParams(parseUrlParams());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const updateUrl = useCallback((newParams: Partial<UrlState>, replace: boolean = false) => {
    setParams((prev) => {
      const merged = { ...prev, ...newParams };
      const searchParams = new URLSearchParams();

      if (merged.page > 1) {
        searchParams.set('page', merged.page.toString());
      }
      if (merged.limit !== 10) {
        searchParams.set('limit', merged.limit.toString());
      }
      if (merged.q && merged.q.trim()) {
        searchParams.set('q', merged.q.trim());
      }
      if (merged.category && merged.category !== 'all') {
        searchParams.set('category', merged.category);
      }
      if (merged.sortBy) {
        searchParams.set('sortBy', merged.sortBy);
        searchParams.set('order', merged.order || 'asc');
      }
      if (merged.delay && merged.delay > 0) {
        searchParams.set('delay', merged.delay.toString());
      }
      // Path determination: /products/:id when in detail view, / otherwise
      let targetPath = '/';
      if (merged.view === 'detail' && merged.productId) {
        targetPath = `/products/${merged.productId}`;
      }

      const queryString = searchParams.toString();
      const newUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

      if (replace) {
        window.history.replaceState({}, '', newUrl);
      } else {
        window.history.pushState({}, '', newUrl);
      }

      return merged;
    });
  }, []);

  return {
    params,
    updateUrl,
  };
}
