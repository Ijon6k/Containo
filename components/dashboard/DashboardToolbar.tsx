'use client';

import React from 'react';
import { Search, LayoutGrid, List as ListIcon, Trash2, Layers, Box } from 'lucide-react';

interface DashboardToolbarProps {
  viewMode: 'containers' | 'images';
  setViewMode: (mode: 'containers' | 'images') => void;
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
  onClearImageSelection
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-ui-bg p-3 rounded-md border border-ui-border shadow-sm">
      <div className="flex items-center gap-4">
        {/* Layout Toggle (List vs Grid) - Only for Containers */}
        {viewMode === 'containers' && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/5">
            <button 
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-sm transition-all ${layoutMode === 'list' ? 'bg-brand text-white shadow-md' : 'text-text-sub hover:text-brand'}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-sm transition-all ${layoutMode === 'grid' ? 'bg-brand text-white shadow-md' : 'text-text-sub hover:text-brand'}`}
              title="Module View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bulk Delete Button for Images */}
        {viewMode === 'images' && selectedImagesCount > 0 && (
          <button
            onClick={onBulkDeleteImages}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete ({selectedImagesCount})
          </button>
        )}

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
          <input 
            type="text"
            placeholder={viewMode === 'containers' ? "Search containers..." : "Search images..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ui-accent border border-ui-border rounded-md py-2 pl-10 pr-4 text-xs font-medium tracking-wide focus:outline-none focus:border-brand/50 transition-all text-text-main"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* View Mode Toggle (Containers vs Images) */}
        <div className="flex bg-ui-accent p-1 rounded-md border border-ui-border shadow-inner">
           <button 
             onClick={() => { setViewMode('containers'); onClearImageSelection(); }}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-bold tracking-wide transition-all ${viewMode === 'containers' ? 'bg-brand text-white shadow-lg' : 'text-text-sub hover:text-text-main'}`}
           >
             <Layers className="w-3.5 h-3.5" />
             Containers
           </button>
           <button 
             onClick={() => setViewMode('images')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-bold tracking-wide transition-all ${viewMode === 'images' ? 'bg-brand text-white shadow-lg' : 'text-text-sub hover:text-text-main'}`}
           >
             <Box className="w-3.5 h-3.5" />
             Images
           </button>
        </div>
      </div>
    </div>
  );
}
