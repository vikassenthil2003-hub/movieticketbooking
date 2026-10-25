import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div className="rounded-2xl overflow-hidden bg-cine-800/50 border border-white/5 animate-pulse">
      <div className="aspect-[2/3] bg-cine-700/50 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-cine-700/60 rounded w-3/4" />
        <div className="h-3 bg-cine-700/40 rounded w-1/2" />
        <div className="h-3 bg-cine-700/30 rounded w-2/3" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-cine-800/60 rounded-xl w-full border border-white/5" />
      ))}
    </div>
  );
};

export default { MovieCardSkeleton, TableSkeleton };
