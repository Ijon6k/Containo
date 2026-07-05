import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContainers,
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
} from "../lib/api/container-api";
import { Container } from "@/lib/types";
import { useEffect } from "react";
import { useWS } from "@/components/providers/WebSocketProvider";

// Container data hook — initial fetch via REST, live updates via WebSocket.
// React Query cache is kept in sync by the WebSocket "containers:update" event.
export function useContainers() {
  const queryClient = useQueryClient();
  const { subscribe } = useWS();

  const query = useQuery({
    queryKey: ["containers"],
    queryFn: fetchContainers,
  });

  // Patch React Query cache directly when WebSocket pushes new container data.
  // Avoids redundant refetch calls on every 5s broadcast.
  useEffect(() => {
    const unsub = subscribe("containers:update", (data: Container[]) => {
      queryClient.setQueryData(["containers"], data);
    });
    return () => unsub();
  }, [subscribe, queryClient]);

  const startMutation = useMutation({
    mutationFn: startContainer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["containers"] }),
  });

  const stopMutation = useMutation({
    mutationFn: stopContainer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["containers"] }),
  });

  const restartMutation = useMutation({
    mutationFn: restartContainer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["containers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContainer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["containers"] }),
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
