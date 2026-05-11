'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Container } from '@/lib/types';
import { SystemStats } from '@/components/dashboard/SystemStats';
import { LogModal } from '@/components/dashboard/LogModal';
import { InfoBox } from '@/components/ui/InfoBox';
import { useDashboardActions } from '@/hooks/useDashboardActions';
import { useImageActions } from '@/hooks/useImageActions';
import { DashboardToolbar } from '@/components/dashboard/DashboardToolbar';
import { ContainerListView } from '@/components/dashboard/ContainerListView';
import { ContainerGridView } from '@/components/dashboard/ContainerGridView';
import { ImageListView } from '@/components/dashboard/ImageListView';

interface DashboardProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  systemInfo: any;
  onNavigateToDeploy: () => void;
}

export default function Dashboard({
  addToast,
  showConfirm,
  systemInfo,
  onNavigateToDeploy
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<'containers' | 'images'>('containers');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  const {
    containers,
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
  } = useDashboardActions({ addToast, showConfirm });

  const {
    isLoadingImages,
    selectedImages,
    setSelectedImages,
    deleteImage,
    toggleImageSelection,
    toggleSelectAll,
    bulkDeleteImages,
    filteredImages
  } = useImageActions({ searchQuery, addToast, showConfirm, viewMode });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
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

      {/* Welcome Info */}
      <InfoBox title="Welcome to Containo" variant="info" className="mb-8">
        We're here to make Docker management simple and stress-free. If you're new to this, just remember: 
        <span className="text-text-main font-bold px-1">Containers</span> are where your apps live, and 
        <span className="text-text-main font-bold px-1">Volumes</span> are where your data is safely kept. 
        We handle the technical complexity so you can focus on what matters most—your creations.
      </InfoBox>

      <SystemStats containers={containers} systemInfo={systemInfo} />

      {/* Main Content Area */}
      <div className="space-y-4">
        <DashboardToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedImagesCount={selectedImages.length}
          onBulkDeleteImages={bulkDeleteImages}
          onClearImageSelection={() => setSelectedImages([])}
        />

        {/* List Content */}
        {viewMode === 'containers' && layoutMode === 'list' && (
          <ContainerListView
            containers={filteredContainers}
            expandedStatsIds={expandedStatsIds}
            setExpandedStatsIds={setExpandedStatsIds}
            stats={stats}
            onToggleStatus={toggleStatus}
            onRestart={restartContainer}
            onOpenLogs={setSelectedContainer}
            onDelete={deleteContainer}
            onOpenWebUI={openWebUI}
          />
        )}

        {viewMode === 'containers' && layoutMode === 'grid' && (
          <ContainerGridView
            containers={filteredContainers}
            stats={stats}
            onToggleStatus={toggleStatus}
            onRestart={restartContainer}
            onOpenLogs={setSelectedContainer}
            onDelete={deleteContainer}
            onOpenWebUI={openWebUI}
          />
        )}

        {viewMode === 'images' && (
          <ImageListView
            images={filteredImages}
            isLoading={isLoadingImages}
            selectedImages={selectedImages}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelect={toggleImageSelection}
            onDelete={deleteImage}
          />
        )}
      </div>

      <LogModal
        container={selectedContainer}
        onClose={() => setSelectedContainer(null)}
      />
    </div>
  );
}
