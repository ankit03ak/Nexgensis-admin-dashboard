import React from 'react';
import { Star, ShieldAlert, Sparkles } from 'lucide-react';

export const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <ShieldAlert className="w-3 h-3" />
        Out of Stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Low ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      In Stock ({stock})
    </span>
  );
};

export const RatingBadge: React.FC<{ rating: number }> = ({ rating }) => {
  const rounded = Number(rating || 0).toFixed(1);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rounded}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const formatted = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : 'General';

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {formatted}
    </span>
  );
};

export const LocalChangeBadge: React.FC<{ isLocal?: boolean; isModified?: boolean }> = ({
  isLocal,
  isModified,
}) => {
  if (isLocal) {
    return (
      <span
        title="Created locally in this session"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-800 border border-violet-200"
      >
        <Sparkles className="w-3 h-3 text-violet-600" />
        New
      </span>
    );
  }
  if (isModified) {
    return (
      <span
        title="Modified locally in this session"
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
      >
        Edited
      </span>
    );
  }
  return null;
};
