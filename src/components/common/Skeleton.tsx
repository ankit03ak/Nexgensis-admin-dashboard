import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-6 gap-4">
        <div className="h-4 bg-slate-300 rounded w-16" />
        <div className="h-4 bg-slate-300 rounded w-48" />
        <div className="h-4 bg-slate-300 rounded w-28 ml-auto" />
        <div className="h-4 bg-slate-300 rounded w-20" />
        <div className="h-4 bg-slate-300 rounded w-16" />
        <div className="h-4 bg-slate-300 rounded w-20" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-16 px-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-2/5" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
            <div className="h-6 bg-slate-200 rounded-full w-24" />
            <div className="h-4 bg-slate-200 rounded w-16 text-right" />
            <div className="h-4 bg-slate-200 rounded w-12" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-8 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-full h-44 bg-slate-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-5 bg-slate-200 rounded w-16" />
            <div className="h-5 bg-slate-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
