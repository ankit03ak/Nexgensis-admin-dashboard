import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductOverlayProvider, useProductOverlay } from './context/ProductOverlayContext';
import { useUrlParams } from './hooks/useUrlParams';
import { useDebounce } from './hooks/useDebounce';
import { productsApi } from './api/productsApi';
import { CategoryItem, Product, ProductFormData } from './types/product';
import { SortField, SortOrder } from './types/query';

import { Navbar } from './components/layout/Navbar';
import { LoginForm } from './components/auth/LoginForm';
import { ProductTable } from './components/products/ProductTable';
import { ProductCards } from './components/products/ProductCards';
import { ProductFilters } from './components/products/ProductFilters';
import { Pagination } from './components/products/Pagination';
import { ProductFormModal } from './components/products/ProductFormModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ProductDetailView } from './components/products/ProductDetailView';
import { TableSkeleton, CardsSkeleton } from './components/common/Skeleton';
import { EmptyState } from './components/common/EmptyState';
import { ErrorState } from './components/common/ErrorState';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastState {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    applyOverlayToList,
    addCreatedProduct,
    updateProductOverlay,
    deleteProductOverlay,
  } = useProductOverlay();

  const { params, updateUrl } = useUrlParams();

  // Search state & debouncing
  const [searchInput, setSearchInput] = useState<string>(params.q || '');
  const debouncedSearch = useDebounce<string>(searchInput, 400);

  // Data fetching states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notification Toast state
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Sequence ref and AbortController ref to prevent search race conditions
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch categories once on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingCategories(true);
    productsApi
      .getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch(() => {
        // Fallback categories if network hiccups
        setCategories([
          { slug: 'beauty', name: 'Beauty', url: '' },
          { slug: 'fragrances', name: 'Fragrances', url: '' },
          { slug: 'furniture', name: 'Furniture', url: '' },
          { slug: 'groceries', name: 'Groceries', url: '' },
          { slug: 'home-decoration', name: 'Home Decoration', url: '' },
          { slug: 'laptops', name: 'Laptops', url: '' },
          { slug: 'smartphones', name: 'Smartphones', url: '' },
        ]);
      })
      .finally(() => {
        setIsLoadingCategories(false);
      });
  }, [isAuthenticated]);

  // Sync debounced search to URL query params and reset page to 1
  useEffect(() => {
    if (debouncedSearch !== params.q) {
      updateUrl({ q: debouncedSearch, page: 1 }, true);
    }
  }, [debouncedSearch, params.q, updateUrl]);

  /**
   * Main data fetching effect with robust race-condition protection:
   * 1. Abort previous in-flight Axios requests
   * 2. Increment sequence ID to discard stale out-of-order responses
   */
  const loadProducts = useCallback(async () => {
    if (!isAuthenticated || params.view === 'detail') return;

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Increment request ID
    const currentRequestId = ++activeRequestIdRef.current;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await productsApi.getProducts(
        {
          page: params.page,
          limit: params.limit,
          q: params.q,
          category: params.category,
          sortBy: params.sortBy,
          order: params.order,
          delay: params.delay,
        },
        controller.signal
      );

      // Verify this is still the latest request (guarantees old search results never replace new ones)
      if (currentRequestId === activeRequestIdRef.current) {
        const { products: overlaidProducts, adjustedTotalDelta } = applyOverlayToList(
          response.products,
          {
            isFirstPage: params.page === 1,
            searchQuery: params.q,
            category: params.category,
          }
        );

        setProducts(overlaidProducts);
        setTotalProducts(Math.max(0, response.total + adjustedTotalDelta));
      }
    } catch (err: unknown) {
      // Ignore AbortError / canceled requests
      const isCanceled =
        (err as { name?: string })?.name === 'CanceledError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED';
      if (!isCanceled && currentRequestId === activeRequestIdRef.current) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to load products from DummyJSON API.';
        setFetchError(msg);
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    isAuthenticated,
    params.view,
    params.page,
    params.limit,
    params.q,
    params.category,
    params.sortBy,
    params.order,
    params.delay,
    applyOverlayToList,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handlers for URL State
  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 });
  };

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
  };

  const handleCategoryChange = (newCategory: string) => {
    updateUrl({ category: newCategory === 'all' ? '' : newCategory, page: 1 });
  };

  const handleSortChange = (sortBy: SortField, order: SortOrder) => {
    updateUrl({ sortBy, order, page: 1 });
  };

  const handleToggleDelay = () => {
    const nextDelay = params.delay ? undefined : 2000;
    updateUrl({ delay: nextDelay });
    showToast(
      'success',
      nextDelay
        ? 'Simulated API delay set to 2000ms (&delay=2000). Try typing fast to verify race-condition protection!'
        : 'API delay set to 0ms (instant).'
    );
  };

  // Navigation to detail view
  const handleViewProduct = (product: Product) => {
    updateUrl({ view: 'detail', productId: product.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    updateUrl({ view: 'table', productId: undefined });
  };

  // Add & Edit Actions
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsAddEditModalOpen(true);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        // Real API call to DummyJSON PUT /products/{id}
        await productsApi.updateProduct(editingProduct.id, formData);

        // Apply local overlay so update immediately reflects
        updateProductOverlay(editingProduct.id, formData);
        showToast('success', `Product "${formData.title}" updated successfully.`);
      } else {
        // Real API call to DummyJSON POST /products/add
        const newProduct = await productsApi.addProduct(formData);

        // Add to local overlay so it stays visible and persistent
        addCreatedProduct({
          ...newProduct,
          id: newProduct.id || Date.now(),
          ...formData,
        });
        showToast('success', `Product "${formData.title}" added to inventory.`);
      }
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed.';
      showToast('error', msg);
      throw err;
    }
  };

  // Delete Action
  const handleOpenDeleteConfirm = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      // Real API call to DummyJSON DELETE /products/{id}
      await productsApi.deleteProduct(deletingProduct.id);

      // Apply overlay
      deleteProductOverlay(deletingProduct.id);
      showToast('success', `Product "${deletingProduct.title}" deleted.`);
      setDeletingProduct(null);

      // If user was on detail page of deleted product, navigate back
      if (params.view === 'detail' && params.productId === deletingProduct.id) {
        handleBackToDashboard();
      } else {
        loadProducts();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    updateUrl({ q: '', category: '', page: 1 });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-slideUp ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
            )}
            <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <Navbar
        onNavigateHome={handleBackToDashboard}
        delay={params.delay}
        onToggleDelay={handleToggleDelay}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {params.view === 'detail' && params.productId ? (
          /* Product Details Page */
          <ProductDetailView
            productId={params.productId}
            onBack={handleBackToDashboard}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteConfirm}
            delay={params.delay}
          />
        ) : (
          /* Product List Dashboard */
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <ProductFilters
              searchQuery={searchInput}
              category={params.category}
              sortBy={params.sortBy}
              order={params.order}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              onSearchChange={handleSearchChange}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onOpenAddModal={handleOpenAddModal}
              isSearching={isLoading && !!params.q}
            />

            {/* Error State */}
            {fetchError ? (
              <ErrorState
                title="Could not retrieve products"
                message={fetchError}
                onRetry={loadProducts}
                isRetrying={isLoading}
              />
            ) : isLoading ? (
              /* Loading Skeletons */
              <div>
                <div className="hidden md:block">
                  <TableSkeleton rows={params.limit > 20 ? 15 : params.limit} />
                </div>
                <div className="md:hidden">
                  <CardsSkeleton count={params.limit > 20 ? 8 : params.limit} />
                </div>
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <EmptyState
                title="No matching products found"
                message={
                  params.q || params.category
                    ? `No products found matching query "${params.q || params.category}". Try clearing filters or using different keywords.`
                    : 'Your catalog is empty.'
                }
                onReset={params.q || params.category ? handleResetFilters : undefined}
                resetLabel="Clear all filters & search"
              />
            ) : (
              /* Product Lists */
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <ProductTable
                    products={products}
                    onViewProduct={handleViewProduct}
                    onEditProduct={handleOpenEditModal}
                    onDeleteProduct={handleOpenDeleteConfirm}
                  />
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden">
                  <ProductCards
                    products={products}
                    onViewProduct={handleViewProduct}
                    onEditProduct={handleOpenEditModal}
                    onDeleteProduct={handleOpenDeleteConfirm}
                  />
                </div>

                {/* Pagination Controls */}
                <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-2 shadow-xs">
                  <Pagination
                    page={params.page}
                    limit={params.limit}
                    total={totalProducts}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        productToEdit={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Product Deletion"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        itemTitle={deletingProduct?.title}
        confirmLabel="Yes, Delete Product"
        cancelLabel="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProductOverlayProvider>
        <AuthGate />
      </ProductOverlayProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <DashboardContent />;
}
