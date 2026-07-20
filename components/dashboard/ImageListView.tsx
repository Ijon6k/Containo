'use client';

import React from 'react';
import { ImageCard } from './ImageCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface ImageListViewProps {
  images: any[];
  isLoading: boolean;
  selectedImages: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ImageListView({
  images,
  isLoading,
  selectedImages,
  onToggleSelectAll,
  onToggleSelect,
  onDelete
}: ImageListViewProps) {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden shadow-2xl">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-surface2/50">
        <div className="col-span-1 flex items-center">
          <input 
            type="checkbox" 
            checked={images.length > 0 && selectedImages.length === images.length}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
          />
        </div>
        <div className="col-span-4 text-sm font-semibold text-text-secondary">Registry tags</div>
        <div className="col-span-2 text-sm font-semibold text-text-secondary">Artifact ID</div>
        <div className="col-span-2 text-sm font-semibold text-text-secondary">Size</div>
        <div className="col-span-2 text-sm font-semibold text-text-secondary">Created</div>
        <div className="col-span-1 text-sm font-semibold text-text-secondary text-right">Ops</div>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-text-secondary font-mono text-[12px] italic">No images found.</div>
        ) : (
          images.map((img) => (
            <ImageCard 
              key={img.fullId} 
              image={img} 
              onDelete={onDelete}
              isSelected={selectedImages.includes(img.repoTags?.[0] || img.fullId)}
              onToggleSelect={() => onToggleSelect(img.repoTags?.[0] || img.fullId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
