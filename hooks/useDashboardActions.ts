import { useState } from 'react';
import { Container } from '@/lib/types';
import { toggleContainerStatus, restartContainerApi, deleteContainerApi } from '@/lib/actions';
import { resolveContainerWebUrl } from '@/lib/network';
import { useStats } from './useStats';
import { useSearch } from './useSearch';

interface UseDashboardActionsProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
}

export const useDashboardActions = ({ 
  containers, 
  setContainers, 
  addToast, 
  showConfirm 
}: UseDashboardActionsProps) => {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [expandedStatsIds, setExpandedStatsIds] = useState<string[]>([]);

  // Atomic Logic Consumption
  const { stats } = useStats(expandedStatsIds);
  const { searchQuery, setSearchQuery, filteredContainers } = useSearch(containers);

  const toggleStatus = async (id: string) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;
    
    try {
      const newStatus = await toggleContainerStatus(id, container.status);
      setContainers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      addToast(`Container ${newStatus === 'running' ? 'started' : 'stopped'} successfully`);
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const restartContainer = async (id: string, name: string) => {
    showConfirm('Restart Container', `Are you sure you want to restart ${name}?`, async () => {
      try {
        await restartContainerApi(id);
        addToast('Container restarted successfully');
      } catch (e: any) {
        addToast(e.message, 'error');
      }
    });
  };

  const deleteContainer = async (container: Container) => {
    showConfirm('Delete Container', `Are you sure you want to delete ${container.name}?`, async () => {
      try {
        await deleteContainerApi(container.id);
        setContainers(prev => prev.filter(c => c.id !== container.id));
        addToast('Container deleted');
      } catch (e: any) {
        addToast(e.message, 'error');
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
