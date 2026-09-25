import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, Info, Plus } from 'lucide-react';
import { CategoryItem } from '../../types/product';
import { SortField, SortOrder } from '../../types/query';

interface ProductFiltersProps {
  searchQuery: string;
  category: string;
  sortBy?: SortField;
  order?: SortOrder;
  categories: CategoryItem[];
  isLoadingCategories: boolean;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sortBy: SortField, order: SortOrder) => void;
  onOpenAddModal: () => void;
  isSearching?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  category,
  sortBy,
  order = 'asc',
  categories,
  isLoadingCategories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onOpenAddModal,
  isSearching = false,
}) => {
  // Local input state for immediate responsive typing
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync with prop when URL changes externally (e.g. back button or clear filters)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearchChange(val); // Parent will debounce the actual API call
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value as SortField;
    onSortChange(newField, order || 'asc');
  };

  const toggleSortOrder = () => {
    const nextOrder: SortOrder = order === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy || 'title', nextOrder);
  };

  // Detect conflict between category filter and search query
  const hasCategoryAndSearch = Boolean(category && category !== 'all' && searchQuery.trim().length > 0);

  return (
    <div className="space-y-3">
      {/* Top Bar: Search, Category, Sort, Add Product */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Search products by title, brand, tag..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : isSearching ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            </div>
          ) : null}
        </div>

        {/* Filters and Actions Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={category || 'all'}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={isLoadingCategories}
              className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy || 'id'}
              onChange={handleSortFieldChange}
              className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              <option value="id">Default (ID)</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          {/* Sort Direction Toggle Button */}
          <button
            type="button"
            onClick={toggleSortOrder}
            title={`Sort order: ${order === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            {order === 'asc' ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Explanatory Notice for DummyJSON Category vs Search API Limitation */}
      {hasCategoryAndSearch && (
        <div className="flex items-center justify-between p-2.5 px-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>API Notice:</strong> DummyJSON API does not support combining{' '}
              <em>search</em> and <em>category filtering</em> on the server. Global search is active for{' '}
              <strong>&ldquo;{searchQuery}&rdquo;</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className="text-xs font-semibold text-amber-900 underline hover:no-underline ml-2 shrink-0 cursor-pointer"
          >
            Clear category filter
          </button>
        </div>
      )}
    </div>
  );
};
