"use client";

import { useState, useCallback } from "react";
import { Volume } from "@/lib/types";
import {
  importBackup as apiImportBackup,
  backupIndividual as apiBackupIndividual,
} from "@/lib/api/volume-api";

interface UseBackupRestoreProps {
  addToast: (msg: string, type?: "success" | "error") => void;
  fetchVolumes: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useBackupRestore({
  addToast,
  fetchVolumes,
  fileInputRef,
}: UseBackupRestoreProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreStep, setRestoreStep] = useState("");

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetVolume?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!targetVolume) {
      addToast("Please select a target volume/container first", "error");
      return;
    }

    setIsRestoring(true);
    setRestoreStep(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append("backup", file);
    formData.append("action", "import");
    formData.append("targetVolume", targetVolume);

    try {
      await apiImportBackup(formData);
      setRestoreProgress(50);
      setRestoreStep("Extracting data to volume...");

      setTimeout(() => {
        setRestoreProgress(100);
        setRestoreStep("Finalizing...");

        setTimeout(() => {
          setIsRestoring(false);
          setRestoreProgress(0);
          addToast(`${targetVolume} restored successfully`);
          fetchVolumes();
        }, 1000);
      }, 2000);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "Import failed";
      addToast(errMsg, "error");
      setIsRestoring(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBackupIndividual = useCallback(
    async (name: string) => {
      addToast(`Exporting ${name}...`);
      try {
        const blob = await apiBackupIndividual(name);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}_backup.tar`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast(`${name} exported successfully`);
      } catch (e: any) {
        addToast(
          e.response?.data?.error || e.message || "Export failed",
          "error",
        );
      }
    },
    [addToast],
  );

  return {
    isRestoring,
    restoreProgress,
    restoreStep,
    handleFileChange,
    handleBackupIndividual,
  };
}
