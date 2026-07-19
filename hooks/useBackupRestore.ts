"use client";

import { useState, useCallback } from "react";
import {
  importBackup as apiImportBackup,
  backupIndividual as apiBackupIndividual,
} from "@/lib/api/volume-api";

interface UseBackupRestoreProps {
  addToast: (msg: string, type?: "success" | "error") => void;
  fetchVolumes: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

// Handles volume backup (export as .tar download) and restore (upload .tar,
// stop dependent containers, extract via alpine helper, restart containers).
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
      setRestoreStep("Extracting data to volume...");
      setRestoreProgress(100);
      setIsRestoring(false);
      setRestoreProgress(0);
      addToast(`${targetVolume} restored successfully`);
      fetchVolumes();
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
        // Trigger browser download of the .tar blob
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
