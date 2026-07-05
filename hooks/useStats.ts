import { useState, useEffect } from "react";
import { ContainerStats } from "@/lib/types";
import { useWS } from "@/components/providers/WebSocketProvider";

// Subscribes to per-container stats via WebSocket. Auto-subscribes when
// expandedStatsIds changes and unsubscribes on cleanup or unmount.
export const useStats = (expandedStatsIds: string[]) => {
  const [stats, setStats] = useState<Record<string, ContainerStats>>({});
  const { sendMessage, subscribe, isConnected } = useWS();

  const idsKey = expandedStatsIds.join(",");

  useEffect(() => {
    if (expandedStatsIds.length === 0) return;

    sendMessage("stats:subscribe", expandedStatsIds);

    const unsubscribe = subscribe("stats:update", (data) => {
      setStats((prev) => ({ ...prev, ...data }));
    });

    return () => {
      unsubscribe();
      sendMessage("stats:unsubscribe", expandedStatsIds);
    };
    // Using idsKey (joined string) instead of expandedStatsIds array
    // to avoid re-subscribing when the array reference changes but contents are identical.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, sendMessage, subscribe, isConnected]);

  return { stats };
};
