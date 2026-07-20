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
    <div className="bg-surface border border-border rounded-md p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4">Volume Recovery</h3>

      <button
        onClick={onImportBackup}
        disabled={isRestoring}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-sm text-base font-medium transition-all disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {isRestoring ? "Restoring..." : "Import Backup"}
      </button>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Select a volume and click the upload icon to restore data from a
          backup file.
        </p>
      </div>
    </div>
  );
}
