import { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { ServiceData } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceData;
  updateService: (id: string, field: keyof ServiceData, value: string) => void;
  removeService: (id: string) => void;
}

export const ServiceCard = ({ service, updateService, removeService }: ServiceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const hasAdvanced =
    (service.depends_on?.trim() ?? '') ||
    (service.networks?.trim() ?? '') ||
    (service.volumes?.trim() ?? '') ||
    (service.env?.trim() ?? '') ||
    (service.command?.trim() ?? '');

  return (
    <div className="border-b border-border last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0 hover:bg-surface2/20 transition-colors -mx-5 px-5 group">
      {/* ── Always-visible core fields ── */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <input
            value={service.name}
            onChange={(e) => updateService(service.id, 'name', e.target.value)}
            className="bg-transparent border-none text-base font-semibold text-text-primary focus:ring-0 p-0 w-full outline-none"
            placeholder="service-name"
          />
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => removeService(service.id)}
              className="p-1.5 hover:bg-danger-bg rounded-sm transition-all text-text-secondary hover:text-danger"
              title="Remove service"
              aria-label={`Remove ${service.name || "service"}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[12px] font-medium text-text-tertiary block mb-1">Image</label>
            <input
              placeholder="nginx:alpine"
              value={service.image || ''}
              onChange={(e) => updateService(service.id, 'image', e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-text-tertiary block mb-1">Ports</label>
            <input
              placeholder="80:80"
              value={service.ports || ''}
              onChange={(e) => updateService(service.id, 'ports', e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <select
              value={service.restartPolicy || 'no'}
              onChange={(e) => updateService(service.id, 'restartPolicy', e.target.value)}
              className="bg-surface border border-border rounded-sm px-2.5 py-1.5 text-[12px] font-medium text-text-secondary outline-none focus:border-brand/50 transition-colors"
            >
              <option value="no">Restart: No</option>
              <option value="always">Restart: Always</option>
              <option value="unless-stopped">Restart: Unless stopped</option>
              <option value="on-failure">Restart: On failure</option>
            </select>
            {hasAdvanced && !expanded && (
              <span className="text-[11px] text-text-tertiary">
                {(service.depends_on?.trim() ? 'deps · ' : '')}
                {(service.volumes?.trim() ? 'vols · ' : '')}
                {(service.networks?.trim() ? 'nets' : '')}
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-sm hover:bg-hover"
            aria-label={expanded ? 'Hide advanced options' : 'Show advanced options'}
          >
            Advanced
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ── Collapsible advanced fields ── */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-text-tertiary block mb-1">Depends on</label>
              <input
                placeholder="db, cache"
                value={service.depends_on || ''}
                onChange={(e) => updateService(service.id, 'depends_on', e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-text-tertiary block mb-1">Networks</label>
              <input
                placeholder="frontend, backend"
                value={service.networks || ''}
                onChange={(e) => updateService(service.id, 'networks', e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-text-tertiary block mb-1">Volumes</label>
              <input
                placeholder="./data:/var/lib/mysql"
                value={service.volumes || ''}
                onChange={(e) => updateService(service.id, 'volumes', e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-text-tertiary block mb-1">Environment</label>
              <input
                placeholder="NODE_ENV=production,DEBUG=*"
                value={service.env || ''}
                onChange={(e) => updateService(service.id, 'env', e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-text-tertiary block mb-1">Command override</label>
            <input
              placeholder="npm start"
              value={service.command || ''}
              onChange={(e) => updateService(service.id, 'command', e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};
