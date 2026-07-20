'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface PruneActionProps {
  isPruning: boolean;
  onPrune: (options: string[]) => void;
}

const OPTIONS = [
  { id: 'containers', label: 'Stopped containers' },
  { id: 'images', label: 'Dangling images' },
  { id: 'images-all', label: 'All unused images' },
  { id: 'volumes', label: 'Unused volumes' },
  { id: 'networks', label: 'Unused networks' },
  { id: 'system', label: 'System prune -a', note: 'docker system prune -af' },
  { id: 'builder', label: 'Builder cache', note: 'docker builder prune -af' },
  { id: 'buildx', label: 'BuildKit cache', note: 'docker buildx prune -af' },
];

export function PruneAction({ isPruning, onPrune }: PruneActionProps) {
  const [selected, setSelected] = useState<string[]>([
    'containers',
    'images',
    'networks',
  ]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const all = selected.length === OPTIONS.length;
  const none = selected.length === 0;

  const toggleAll = () => {
    setSelected(all ? [] : OPTIONS.map((o) => o.id));
  };

  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-danger-bg text-danger flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Deep prune</h3>
            <p className="text-[12px] text-text-secondary mt-0.5 max-w-md">
              Remove unused Docker resources and reclaim disk space. Cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={() => onPrune(selected)}
          disabled={isPruning || none}
          className="px-4 h-8 rounded-md bg-danger hover:bg-danger/90 text-white text-[12px] font-medium transition-colors disabled:opacity-40 shrink-0"
        >
          {isPruning ? 'Pruning...' : `Prune (${selected.length})`}
        </button>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-[12px] text-text-tertiary cursor-pointer select-none pb-1.5 mb-1 border-b border-border">
          <input type="checkbox" checked={all} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-brand" />
          Select all
        </label>
        {OPTIONS.map((opt) => (
          <label key={opt.id}
            className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer select-none ml-1">
            <input type="checkbox" checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)} className="w-3.5 h-3.5 rounded accent-brand" />
            <span>{opt.label}</span>
            {opt.note && <span className="text-[11px] text-text-tertiary ml-auto">{opt.note}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
