import { useState, useMemo } from "react";
import { Container } from "@/lib/types";
import { useStats } from "./useStats";
import { useSearch } from "./useSearch";
import { useContainers } from "./useContainers";
import { useContainerActions } from "./useContainerActions";

interface UseDashboardActionsProps {
  addToast: (msg: string, type?: "success" | "error") => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: "danger" | "warning" | "info",
  ) => void;
}

export const useDashboardActions = ({
  addToast,
  showConfirm,
}: UseDashboardActionsProps) => {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );
  const [selectedTerminalContainer, setSelectedTerminalContainer] =
    useState<Container | null>(null);
  const [expandedStatsIds, setExpandedStatsIds] = useState<string[]>([]);

  const {
    containers,
    startContainer,
    stopContainer,
    restartContainer: restartMutation,
    deleteContainer: deleteMutation,
  } = useContainers();

  const activeContainerIds = useMemo(
    () => containers.filter((c) => c.status === "running").map((c) => c.id),
    [containers],
  );

  const { stats } = useStats(activeContainerIds);
  const { searchQuery, setSearchQuery, filteredContainers } =
    useSearch(containers);

  const { toggleStatus, restartContainer, deleteContainer, openWebUI } =
    useContainerActions({
      containers,
      startContainer,
      stopContainer,
      restartMutation,
      deleteMutation,
      addToast,
      showConfirm,
    });

  return {
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
  };
};
