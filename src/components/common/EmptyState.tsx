import React from 'react';
import { PackageSearch, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  message = 'We couldn’t find any products matching your search criteria or selected filters.',
  onReset,
  resetLabel = 'Reset filters & search',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center my-4 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <PackageSearch className="w-8 h-8 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          {resetLabel}
        </button>
      )}
    </div>
  );
};
