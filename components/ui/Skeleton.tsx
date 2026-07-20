import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse rounded-sm bg-hover ${className}`} />
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-surface border border-border rounded-md p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-8 h-8 rounded-md" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-md" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3 bg-surface border border-border rounded-md">
    <Skeleton className="w-14 h-5 rounded" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-4 w-24 hidden md:block" />
    <div className="flex gap-1">
      <Skeleton className="w-8 h-8 rounded-md" />
      <Skeleton className="w-8 h-8 rounded-md" />
      <Skeleton className="w-8 h-8 rounded-md" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
