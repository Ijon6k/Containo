'use client';

import React from 'react';
import { Search, LayoutGrid, List, Trash2, Layers, Box, FolderOpen } from 'lucide-react';

interface DashboardToolbarProps {
  viewMode: 'containers' | 'stacks' | 'images';
  setViewMode: (mode: 'containers' | 'stacks' | 'images') => void;
  layoutMode: 'list' | 'grid';
  setLayoutMode: (mode: 'list' | 'grid') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedImagesCount: number;
  onBulkDeleteImages: () => void;
  onClearImageSelection: () => void;
}

export function DashboardToolbar({
  viewMode,
  setViewMode,
  layoutMode,
  setLayoutMode,
  searchQuery,
  setSearchQuery,
  selectedImagesCount,
  onBulkDeleteImages,
  onClearImageSelection,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border rounded-md p-2.5">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Layout Toggle */}
        {viewMode === 'containers' && (
          <div className="flex items-center gap-0.5 bg-surface2 rounded-sm p-0.5">
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'list'
                  ? 'bg-brand text-white'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-brand text-white'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bulk Delete */}
        {viewMode === 'images' && selectedImagesCount > 0 && (
          <button
            onClick={onBulkDeleteImages}
            className="relative flex items-center justify-center h-8 w-8 rounded-sm bg-danger hover:bg-danger/80 text-white transition-colors"
            aria-label={`Delete ${selectedImagesCount} images`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-danger text-[10px] font-bold flex items-center justify-center">
              {selectedImagesCount}
            </span>
          </button>
        )}

        {/* Search */}
        <div className="relative w-full sm:max-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
          <input
            type="text"
            placeholder={viewMode === 'containers' ? 'Search containers...' : 'Search images...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-sm h-8 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/40 transition-colors"
          />
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-0.5 bg-surface2 rounded-sm p-0.5">
        <button
          onClick={() => { setViewMode('containers'); onClearImageSelection(); }}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'containers'
              ? 'bg-brand text-white'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Containers
        </button>
        <button
          onClick={() => { setViewMode('stacks'); onClearImageSelection(); }}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'stacks'
              ? 'bg-brand text-white'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Stacks
        </button>
        <button
          onClick={() => setViewMode('images')}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'images'
              ? 'bg-brand text-white'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Images
        </button>
      </div>
    </div>
  );
}
