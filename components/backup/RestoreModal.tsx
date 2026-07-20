"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Database, Upload, AlertCircle } from "lucide-react";
import { Container, Volume } from "@/lib/types";

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Container[];
  volumes: Volume[];
  onConfirm: (targetVolume: string) => void;
}

export function RestoreModal({
  isOpen,
  onClose,
  containers: _containers,
  volumes,
  onConfirm,
}: RestoreModalProps) {
  const [selectedTarget, setSelectedTarget] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-surface border border-border rounded-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-brand" />
            <h3 className="text-base font-semibold text-text-primary">
              Real System Restore
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hover rounded-sm transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-3 block">
              Select Target Volume/Container
            </label>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1 py-1">
              {volumes.map((vol) => (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  key={vol.id}
                  onClick={() => setSelectedTarget(vol.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-md border transition-all text-left group ${
                    selectedTarget === vol.name
                      ? "border-brand bg-brand/10 ring-1 ring-brand shadow-[0_0_15px_-3px_rgba(var(--brand-rgb),0.3)]"
                      : "border-border bg-surface2 hover:bg-hover hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-sm transition-colors ${
                        selectedTarget === vol.name
                          ? "bg-brand text-white"
                          : "bg-hover text-text-secondary group-hover:text-text-primary"
                      }`}
                    >
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          selectedTarget === vol.name
                            ? "text-brand"
                            : "text-text-primary"
                        }`}
                      >
                        {vol.name}
                      </p>
                      <p className="text-[12px] text-text-tertiary font-mono mt-0.5">
                        {vol.mountpoint}
                      </p>
                    </div>
                  </div>
                  {selectedTarget === vol.name && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.8)]"
                    />
                  )}
                </motion.button>
              ))}

              {volumes.length === 0 && (
                <div className="p-8 text-center bg-hover rounded-sm border border-dashed border-border">
                  <AlertCircle className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No volumes detected</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-brand/5 border border-brand/10 rounded-sm flex gap-3">
            <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Restoring will overwrite existing data in the target volume. This
              action uses real Docker extraction and cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-4 bg-surface2 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTarget}
            onClick={() => onConfirm(selectedTarget)}
            className="flex-1 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-sm text-base font-medium transition-all disabled:opacity-50"
          >
            Next: Select File
          </button>
        </div>
      </motion.div>
    </div>
  );
}
