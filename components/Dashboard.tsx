"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SystemStats } from "@/components/dashboard/SystemStats";
import { LogModal } from "@/components/dashboard/LogModal";
import { TerminalModal } from "@/components/dashboard/TerminalModal";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { useImageActions } from "@/hooks/useImageActions";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { ContainerListView } from "@/components/dashboard/ContainerListView";
import { ContainerGridView } from "@/components/dashboard/ContainerGridView";
import { ImageListView } from "@/components/dashboard/ImageListView";
import { StackListView } from "@/components/dashboard/StackListView";
import { useStacks } from "@/hooks/useStacks";
import { SkeletonGrid, SkeletonRow } from "@/components/ui/Skeleton";

interface DashboardProps {
  addToast: (msg: string, type?: "success" | "error") => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: "danger" | "warning" | "info",
  ) => void;
  systemInfo: any;
  onNavigateToDeploy: () => void;
}

export default function Dashboard({
  addToast,
  showConfirm,
  systemInfo,
  onNavigateToDeploy,
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<"containers" | "stacks" | "images">("containers");
  const [layoutMode, setLayoutMode] = useState<"list" | "grid">("list");

  const {
    containers,
    selectedContainer,
    setSelectedContainer,
    selectedTerminalContainer,
    setSelectedTerminalContainer,
    searchQuery,
    setSearchQuery,
    stats,
    expandedStatsIds,
    setExpandedStatsIds,
    toggleStatus,
    restartContainer,
    deleteContainer,
    openWebUI,
    filteredContainers,
    startContainer,
    stopContainer,
  } = useDashboardActions({ addToast, showConfirm });

  const stacks = useStacks(filteredContainers);

  const {
    isLoadingImages,
    selectedImages,
    setSelectedImages,
    deleteImage,
    toggleImageSelection,
    toggleSelectAll,
    bulkDeleteImages,
    filteredImages,
  } = useImageActions({ searchQuery, addToast, showConfirm, viewMode });

  const loading = containers.length === 0 && filteredContainers.length === 0 && !systemInfo;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">Containers</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Manage and monitor your Docker containers</p>
        </div>
        <button
          onClick={onNavigateToDeploy}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-sm bg-brand hover:bg-brand-hover text-white text-base font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create container
        </button>
      </div>

      {loading ? <SkeletonGrid count={4} /> : <SystemStats containers={containers} systemInfo={systemInfo} />}

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

      {loading ? (
        <div className="space-y-0.5">
          <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      ) : (
        <>
          {viewMode === "containers" && layoutMode === "list" && (
            <ContainerListView
              containers={filteredContainers}
              expandedStatsIds={expandedStatsIds}
              setExpandedStatsIds={setExpandedStatsIds}
              stats={stats}
              onToggleStatus={toggleStatus}
              onRestart={restartContainer}
              onOpenLogs={setSelectedContainer}
              onOpenTerminal={setSelectedTerminalContainer}
              onDelete={deleteContainer}
              onOpenWebUI={openWebUI}
            />
          )}

          {viewMode === "containers" && layoutMode === "grid" && (
            <ContainerGridView
              containers={filteredContainers}
              stats={stats}
              onToggleStatus={toggleStatus}
              onRestart={restartContainer}
              onOpenLogs={setSelectedContainer}
              onOpenTerminal={setSelectedTerminalContainer}
              onDelete={deleteContainer}
              onOpenWebUI={openWebUI}
            />
          )}

          {viewMode === "stacks" && (
            <StackListView
              stacks={stacks}
              expandedStatsIds={expandedStatsIds}
              setExpandedStatsIds={setExpandedStatsIds}
              stats={stats}
              onToggleStatus={toggleStatus}
              onRestart={restartContainer}
              onOpenLogs={setSelectedContainer}
              onOpenTerminal={setSelectedTerminalContainer}
              onDelete={deleteContainer}
              onOpenWebUI={openWebUI}
              startContainer={startContainer}
              stopContainer={stopContainer}
              addToast={addToast}
              showConfirm={showConfirm}
            />
          )}

          {viewMode === "images" && (
            <ImageListView
              images={filteredImages}
              isLoading={isLoadingImages}
              selectedImages={selectedImages}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelect={toggleImageSelection}
              onDelete={deleteImage}
            />
          )}
        </>
      )}

      <LogModal container={selectedContainer} onClose={() => setSelectedContainer(null)} />
      <TerminalModal container={selectedTerminalContainer} onClose={() => setSelectedTerminalContainer(null)} />
    </div>
  );
}
