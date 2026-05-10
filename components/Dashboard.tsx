'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search,
  Box,
  Layers,
  Activity,
  LayoutGrid,
  List as ListIcon,
  Trash2
} from 'lucide-react';
import { Container } from '@/lib/types';
import CreateContainerFlow from './CreateContainerFlow';
import { ContainerCard } from '@/components/dashboard/ContainerCard';
import { ContainerGridCard } from '@/components/dashboard/ContainerGridCard';
import { ImageCard } from '@/components/dashboard/ImageCard';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { LogModal } from '@/components/dashboard/LogModal';
import { SystemStats } from '@/components/dashboard/SystemStats';
import { useDashboardActions } from '@/hooks/useDashboardActions';

interface DashboardProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  systemInfo: any;
  onNavigateToDeploy: () => void;
}

export default function Dashboard({ containers, setContainers, addToast, showConfirm, systemInfo, onNavigateToDeploy }: DashboardProps) {
  const [viewMode, setViewMode] = useState<'containers' | 'images'>('containers');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [images, setImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const {
    selectedContainer,
    setSelectedContainer,
    searchQuery,
    setSearchQuery,
    stats,
    expandedStatsIds,
    setExpandedStatsIds,
    toggleStatus,
    restartContainer,
    deleteContainer,
    openWebUI,
    filteredContainers
  } = useDashboardActions({ containers, setContainers, addToast, showConfirm });

  const fetchImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        setImages(await res.json());
      }
    } catch (e) {
      addToast('Failed to fetch images', 'error');
    } finally {
      setIsLoadingImages(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (viewMode === 'images') {
      fetchImages();
    }
  }, [viewMode, fetchImages]);

  const deleteImage = async (id: string, force: boolean = false) => {
    const title = force ? 'Force Delete Image' : 'Delete Image';
    const msg = force 
      ? 'This image is currently in use. Forcing deletion may affect existing containers. Continue?' 
      : 'Are you sure? This image will be permanently removed.';
    
    showConfirm(title, msg, async () => {
      try {
        const res = await fetch(`/api/images?id=${id}${force ? '&force=true' : ''}`, { method: 'DELETE' });
        if (res.ok) {
          addToast(force ? 'Image forcefully removed' : 'Image deleted successfully');
          fetchImages();
        } else {
          const err = await res.json();
          if (err.error?.includes('conflict') && !force) {
             // Offer force delete
             addToast('Image is in use. Use Force Delete to remove.', 'error');
             deleteImage(id, true);
          } else {
             addToast(err.error || 'Failed to delete image', 'error');
          }
        }
      } catch (e) {
        addToast('Failed to delete image', 'error');
      }
    }, force ? 'danger' : 'warning');
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.repoTags?.[0] || img.fullId));
    }
  };

  const bulkDeleteImages = () => {
    if (selectedImages.length === 0) return;
    showConfirm(
      'Delete Selected Images',
      `Are you sure you want to delete ${selectedImages.length} image(s)? This action cannot be undone.`,
      async () => {
        for (const id of selectedImages) {
          try {
            await fetch(`/api/images?id=${id}`, { method: 'DELETE' });
          } catch (e) { /* continue */ }
        }
        addToast(`${selectedImages.length} image(s) deleted`);
        setSelectedImages([]);
        fetchImages();
      },
      'danger'
    );
  };

  const filteredImages = images.filter(img => 
    (img.repoTags?.[0] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-text-main tracking-tight">Containers</h1>
          <p className="text-sm text-text-sub mt-1">Manage and monitor your Docker containers.</p>
        </div>
        <button 
          onClick={onNavigateToDeploy}
          className="bg-brand hover:bg-brand/90 text-white px-5 py-2.5 rounded-md flex items-center gap-2 text-sm font-semibold transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Container
        </button>
      </div>

      <SystemStats containers={containers} systemInfo={systemInfo} />

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Controls Toolbar */}
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
            {viewMode === 'images' && selectedImages.length > 0 && (
              <button
                onClick={bulkDeleteImages}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete ({selectedImages.length})
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
                 onClick={() => { setViewMode('containers'); setSelectedImages([]); }}
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

        {/* List Content */}
        {viewMode === 'containers' && layoutMode === 'list' ? (
          <div className="card overflow-hidden border-white/5 bg-ui-bg rounded-md shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="col-span-2 text-xs font-semibold text-text-sub uppercase tracking-wide">Status</div>
              <div className="col-span-3 text-xs font-semibold text-text-sub uppercase tracking-wide">Container Name</div>
              <div className="col-span-4 text-xs font-semibold text-text-sub uppercase tracking-wide">Image</div>
              <div className="col-span-3 text-xs font-semibold text-text-sub uppercase tracking-wide text-right">Operations</div>
            </div>
            <div className="divide-y divide-ui-border">
              {filteredContainers.length === 0 ? (
                <div className="p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest italic">No operational units detected.</div>
              ) : (
                filteredContainers.map((c) => (
                  <React.Fragment key={c.id}>
                    <ContainerCard 
                      container={c}
                      isExpanded={expandedStatsIds.includes(c.id)}
                      onToggleExpand={() => setExpandedStatsIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                      onToggleStatus={toggleStatus}
                      onRestart={restartContainer}
                      onOpenLogs={setSelectedContainer}
                      onDelete={deleteContainer}
                      onOpenWebUI={openWebUI}
                    />
                    <AnimatePresence>
                      {expandedStatsIds.includes(c.id) && (
                        <StatsPanel stats={stats[c.id]} />
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        ) : viewMode === 'containers' && layoutMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContainers.length === 0 ? (
              <div className="col-span-full p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest card bg-ui-bg border-ui-border rounded-md">No operational units detected.</div>
            ) : (
              filteredContainers.map((c) => (
                <ContainerGridCard 
                  key={c.id}
                  container={c}
                  stats={stats[c.id]}
                  onToggleStatus={toggleStatus}
                  onRestart={restartContainer}
                  onOpenLogs={setSelectedContainer}
                  onDelete={deleteContainer}
                  onOpenWebUI={openWebUI}
                />
              ))
            )}
          </div>
        ) : (
          <div className="card overflow-hidden border-white/5 bg-ui-bg rounded-md shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  checked={filteredImages.length > 0 && selectedImages.length === filteredImages.length}
                  onChange={toggleSelectAll}
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
              {isLoadingImages ? (
                <div className="p-12 flex justify-center">
                  <Activity className="w-8 h-8 text-brand animate-spin" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest italic">No images found.</div>
              ) : (
                filteredImages.map((img) => (
                  <ImageCard 
                    key={img.fullId} 
                    image={img} 
                    onDelete={deleteImage}
                    isSelected={selectedImages.includes(img.repoTags?.[0] || img.fullId)}
                    onToggleSelect={() => toggleImageSelection(img.repoTags?.[0] || img.fullId)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <LogModal 
        container={selectedContainer} 
        onClose={() => setSelectedContainer(null)} 
      />
    </div>
  );
}
