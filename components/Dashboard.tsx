'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search
} from 'lucide-react';
import { Container } from '@/lib/types';
import CreateContainerFlow from './CreateContainerFlow';
import { ContainerCard } from './dashboard/ContainerCard';
import { StatsPanel } from './dashboard/StatsPanel';
import { LogModal } from './dashboard/LogModal';
import { SystemStats } from './dashboard/SystemStats';
import { useDashboardActions } from '@/hooks/useDashboardActions';

interface DashboardProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  systemInfo: any;
}

export default function Dashboard({ containers, setContainers, addToast, showConfirm, systemInfo }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Containers</h1>
          <p className="text-text-sub mt-1">Overview of your running services.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New
        </button>
      </div>

      <SystemStats containers={containers} systemInfo={systemInfo} />

      {/* Container List */}
      <div className="card overflow-hidden border-white/5 bg-[#121214]">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
            <input 
              type="text"
              placeholder="Search containers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c1f] border border-white/5 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand/50 transition-colors text-text-main"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="col-span-2 text-[10px] font-bold text-text-sub uppercase tracking-widest">Status</div>
          <div className="col-span-3 text-[10px] font-bold text-text-sub uppercase tracking-widest">Name</div>
          <div className="col-span-4 text-[10px] font-bold text-text-sub uppercase tracking-widest">Image</div>
          <div className="col-span-3 text-[10px] font-bold text-text-sub uppercase tracking-widest text-right">Actions</div>
        </div>

        <div className="divide-y divide-ui-border">
          {filteredContainers.length === 0 ? (
            <div className="p-12 text-center text-text-sub italic">No containers found.</div>
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

      <LogModal 
        container={selectedContainer} 
        onClose={() => setSelectedContainer(null)} 
      />

      <CreateContainerFlow 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        addToast={addToast} 
      />
    </div>
  );
}
