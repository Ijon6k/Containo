"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { useNotify } from "@/components/providers/NotificationProvider";
import { useWS } from "@/components/providers/WebSocketProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { addToast, showConfirm } = useNotify();
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const { subscribe } = useWS();

  useEffect(() => {
    let active = true;
    fetch("/api/system")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setSystemInfo(data);
      })
      .catch(console.error);

    const unsubSystem = subscribe("system:update", (data) => {
      setSystemInfo(data);
    });

    return () => {
      active = false;
      unsubSystem();
    };
  }, [subscribe]);

  return (
    <Dashboard
      addToast={addToast}
      showConfirm={showConfirm}
      systemInfo={systemInfo}
      onNavigateToDeploy={() => router.push("/deploy")}
    />
  );
}
