import { useState } from 'react';
import { Container } from '@/lib/types';
import { resolveContainerWebUrl } from '@/lib/utils/network';
import { useStats } from './useStats';
import { useSearch } from './useSearch';
import { useContainers } from './useContainers';

interface UseDashboardActionsProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
}

export const useDashboardActions = ({ 
  addToast, 
  showConfirm 
}: UseDashboardActionsProps) => {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [expandedStatsIds, setExpandedStatsIds] = useState<string[]>([]);

  // Atomic Logic Consumption
  const { containers, startContainer, stopContainer, restartContainer: restartMutation, deleteContainer: deleteMutation } = useContainers();
  const { stats } = useStats(expandedStatsIds);
  const { searchQuery, setSearchQuery, filteredContainers } = useSearch(containers as Container[]);

  const toggleStatus = async (id: string) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;
    
    try {
      if (container.status === 'running') {
        await stopContainer(id);
        addToast(`Container stopped successfully`);
      } else {
        await startContainer(id);
        addToast(`Container started successfully`);
      }
    } catch (e: any) {
      addToast(e.message || 'Action failed', 'error');
    }
  };

  const restartContainer = async (id: string, name: string) => {
    showConfirm('Restart Container', `Are you sure you want to restart ${name}?`, async () => {
      try {
        await restartMutation(id);
        addToast('Container restarted successfully');
      } catch (e: any) {
        addToast(e.message || 'Action failed', 'error');
      }
    });
  };

  const deleteContainer = async (container: Container) => {
    showConfirm('Delete Container', `Are you sure you want to delete ${container.name}?`, async () => {
      try {
        await deleteMutation(container.id);
        addToast('Container deleted');
      } catch (e: any) {
        addToast(e.message || 'Action failed', 'error');
      }
    }, 'danger');
  };

  const openWebUI = (c: Container) => {
    const url = resolveContainerWebUrl(c);
    if (url) {
      window.open(url, '_blank');
    } else {
      addToast(`Could not auto-detect web port for ${c.name}. Please check container logs.`, 'error');
    }
  };

  return {
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
  };
};
