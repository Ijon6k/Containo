"use client";

import React from "react";
import { Upload } from "lucide-react";

interface RecoveryActionsProps {
  onImportBackup: () => void;
  isRestoring: boolean;
}

export function RecoveryActions({
  onImportBackup,
  isRestoring,
}: RecoveryActionsProps) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-bold text-text-main mb-4">Volume Recovery</h3>

      <button
        onClick={onImportBackup}
        disabled={isRestoring}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 btn-primary rounded-md text-xs font-bold transition-all disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {isRestoring ? "Restoring..." : "Import Backup"}
      </button>

      <div className="mt-4 pt-4 border-t border-ui-border">
        <p className="text-[10px] text-text-sub leading-relaxed">
          Select a volume and click the upload icon to restore data from a
          backup file.
        </p>
      </div>
    </div>
  );
}
