'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { ImageCard } from './ImageCard';

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
    <div className="card overflow-hidden border-white/5 bg-ui-bg rounded-md shadow-2xl">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="col-span-1 flex items-center">
          <input 
            type="checkbox" 
            checked={images.length > 0 && selectedImages.length === images.length}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-ui-border accent-brand cursor-pointer"
          />
        </div>
        <div className="col-span-4 text-xs font-semibold text-text-sub uppercase tracking-wide">Registry Tags</div>
        <div className="col-span-2 text-xs font-semibold text-text-sub uppercase tracking-wide">Artifact ID</div>
        <div className="col-span-2 text-xs font-semibold text-text-sub uppercase tracking-wide">Size</div>
        <div className="col-span-2 text-xs font-semibold text-text-sub uppercase tracking-wide">Created</div>
        <div className="col-span-1 text-xs font-semibold text-text-sub uppercase tracking-wide text-right">Ops</div>
      </div>
      <div className="divide-y divide-ui-border">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Activity className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest italic">No images found.</div>
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
