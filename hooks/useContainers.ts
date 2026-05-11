import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchContainers, 
  startContainer, 
  stopContainer, 
  restartContainer, 
  deleteContainer
} from '../lib/api/container-api';
import { Container } from '@/lib/types';
import { useEffect } from 'react';
import { useWS } from '@/components/providers/WebSocketProvider';

export function useContainers() {
  const queryClient = useQueryClient();
  const { subscribe } = useWS();

  const query = useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
  });

  // Sync WebSocket updates with React Query Cache
  useEffect(() => {
    const unsub = subscribe('containers:update', (data: Container[]) => {
      queryClient.setQueryData(['containers'], data);
    });
    return () => unsub();
  }, [subscribe, queryClient]);

  const startMutation = useMutation({
    mutationFn: startContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] })
  });

  const stopMutation = useMutation({
    mutationFn: stopContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] })
  });

  const restartMutation = useMutation({
    mutationFn: restartContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContainer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['containers'] })
  });

  return {
    containers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    startContainer: startMutation.mutateAsync,
    stopContainer: stopMutation.mutateAsync,
    restartContainer: restartMutation.mutateAsync,
    deleteContainer: deleteMutation.mutateAsync,
  };
}
