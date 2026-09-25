import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product } from '../types/product';

interface LocalChanges {
  created: Product[];
  updated: Record<number, Partial<Product>>;
  deletedIds: number[];
}

const STORAGE_KEY = 'product_admin_crud_overlay';

interface ProductOverlayContextType {
  createdProducts: Product[];
  updatedMap: Record<number, Partial<Product>>;
  deletedIds: number[];
  applyOverlayToList: (
    apiProducts: Product[],
    options?: {
      isFirstPage?: boolean;
      searchQuery?: string;
      category?: string;
    }
  ) => { products: Product[]; adjustedTotalDelta: number };
  applyOverlayToSingle: (apiProduct: Product) => Product | null;
  addCreatedProduct: (product: Product) => void;
  updateProductOverlay: (id: number, updates: Partial<Product>) => void;
  deleteProductOverlay: (id: number) => void;
  resetAllLocalChanges: () => void;
  hasLocalChanges: boolean;
}

const ProductOverlayContext = createContext<ProductOverlayContextType | undefined>(undefined);

export const ProductOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [changes, setChanges] = useState<LocalChanges>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return { created: [], updated: {}, deletedIds: [] };
  });

  // Persist local modifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    } catch {
      // Storage full or unavailable
    }
  }, [changes]);

  const addCreatedProduct = useCallback((product: Product) => {
    setChanges((prev) => ({
      ...prev,
      created: [{ ...product, isLocal: true }, ...prev.created],
    }));
  }, []);

  const updateProductOverlay = useCallback((id: number, updates: Partial<Product>) => {
    setChanges((prev) => {
      // If it's a locally created product, update it directly in the created list
      const isLocallyCreated = prev.created.some((p) => p.id === id);
      if (isLocallyCreated) {
        return {
          ...prev,
          created: prev.created.map((p) => (p.id === id ? { ...p, ...updates, isModified: true } : p)),
        };
      }

      return {
        ...prev,
        updated: {
          ...prev.updated,
          [id]: {
            ...(prev.updated[id] || {}),
            ...updates,
            isModified: true,
          },
        },
      };
    });
  }, []);

  const deleteProductOverlay = useCallback((id: number) => {
    setChanges((prev) => ({
      ...prev,
      // Remove from created list if it was locally created
      created: prev.created.filter((p) => p.id !== id),
      // Add to deleted IDs list
      deletedIds: prev.deletedIds.includes(id) ? prev.deletedIds : [...prev.deletedIds, id],
    }));
  }, []);

  const resetAllLocalChanges = useCallback(() => {
    setChanges({ created: [], updated: {}, deletedIds: [] });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  /**
   * Transforms raw API products by:
   * 1. Removing items marked as deleted
   * 2. Merging local edits
   * 3. Prepending matching locally created items on first page
   */
  const applyOverlayToList = useCallback(
    (
      apiProducts: Product[],
      options?: {
        isFirstPage?: boolean;
        searchQuery?: string;
        category?: string;
      }
    ) => {
      const { isFirstPage = true, searchQuery = '', category = '' } = options || {};

      // 1. Filter out deleted products and apply modifications
      let processed = apiProducts
        .filter((p) => !changes.deletedIds.includes(p.id))
        .map((p) => {
          if (changes.updated[p.id]) {
            return { ...p, ...changes.updated[p.id], isModified: true };
          }
          return p;
        });

      // 2. Prepend created products if we are on the first page
      if (isFirstPage) {
        let matchingCreated = changes.created.filter(
          (p) => !changes.deletedIds.includes(p.id)
        );

        if (category && category !== 'all') {
          matchingCreated = matchingCreated.filter(
            (p) => p.category.toLowerCase() === category.toLowerCase()
          );
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          matchingCreated = matchingCreated.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              (p.description && p.description.toLowerCase().includes(q)) ||
              (p.brand && p.brand.toLowerCase().includes(q))
          );
        }

        // Prepend to current list
        processed = [...matchingCreated, ...processed];
      }

      const totalDelta = changes.created.length - changes.deletedIds.length;

      return {
        products: processed,
        adjustedTotalDelta: totalDelta,
      };
    },
    [changes]
  );

  /**
   * Applies overlay to a single product detail item
   */
  const applyOverlayToSingle = useCallback(
    (apiProduct: Product): Product | null => {
      if (changes.deletedIds.includes(apiProduct.id)) {
        return null; // Marked as deleted
      }

      // Check if it's one of locally created items
      const localItem = changes.created.find((p) => p.id === apiProduct.id);
      if (localItem) {
        return localItem;
      }

      if (changes.updated[apiProduct.id]) {
        return { ...apiProduct, ...changes.updated[apiProduct.id], isModified: true };
      }

      return apiProduct;
    },
    [changes]
  );

  const hasLocalChanges =
    changes.created.length > 0 ||
    Object.keys(changes.updated).length > 0 ||
    changes.deletedIds.length > 0;

  return (
    <ProductOverlayContext.Provider
      value={{
        createdProducts: changes.created,
        updatedMap: changes.updated,
        deletedIds: changes.deletedIds,
        applyOverlayToList,
        applyOverlayToSingle,
        addCreatedProduct,
        updateProductOverlay,
        deleteProductOverlay,
        resetAllLocalChanges,
        hasLocalChanges,
      }}
    >
      {children}
    </ProductOverlayContext.Provider>
  );
};

export const useProductOverlay = () => {
  const context = useContext(ProductOverlayContext);
  if (!context) {
    throw new Error('useProductOverlay must be used within a ProductOverlayProvider');
  }
  return context;
};
