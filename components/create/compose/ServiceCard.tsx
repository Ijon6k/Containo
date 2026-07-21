import { memo, useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { ServiceData } from "@/lib/types";

interface ServiceCardProps {
  service: ServiceData;
  updateService: (id: string, field: keyof ServiceData, value: string) => void;
  removeService: (id: string) => void;
}

/**
 * Editable card for one service in a compose stack.
 *
 * Always shows name, image, ports, restart policy. Advanced fields
 * (depends_on, networks, volumes, env, command) collapse behind a
 * toggle to keep the default view compact.
 */
function ServiceCardImpl({ service, updateService, removeService }: ServiceCardProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasAdvanced = Boolean(
    service.depends_on?.trim() ||
      service.networks?.trim() ||
      service.volumes?.trim() ||
      service.env?.trim() ||
      service.command?.trim(),
  );

  const advancedSummary = [
    service.depends_on?.trim() && "deps",
    service.volumes?.trim() && "vols",
    service.networks?.trim() && "nets",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-b border-border last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0 hover:bg-surface2/20 transition-colors -mx-5 px-5 group">
      {/* ── Always-visible core fields ── */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <input
            value={service.name}
            onChange={(e) => updateService(service.id, "name", e.target.value)}
            className="bg-transparent border-none text-base font-semibold text-text-primary focus:ring-0 p-0 w-full outline-none"
            placeholder="service-name"
          />
          <button
            onClick={() => removeService(service.id)}
            className="p-1.5 hover:bg-danger-bg rounded-sm transition-all text-text-secondary hover:text-danger"
            title="Remove service"
            aria-label={`Remove ${service.name || "service"}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FieldLabel>Image</FieldLabel>
            <input
              placeholder="nginx:alpine"
              value={service.image || ""}
              onChange={(e) => updateService(service.id, "image", e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div>
            <FieldLabel>Ports</FieldLabel>
            <input
              placeholder="80:80"
              value={service.ports || ""}
              onChange={(e) => updateService(service.id, "ports", e.target.value)}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <select
              value={service.restartPolicy || "no"}
              onChange={(e) => updateService(service.id, "restartPolicy", e.target.value)}
              className="bg-surface border border-border rounded-sm px-2.5 py-1.5 text-[12px] font-medium text-text-secondary outline-none focus:border-brand/50 transition-colors"
            >
              <option value="no">Restart: No</option>
              <option value="always">Restart: Always</option>
              <option value="unless-stopped">Restart: Unless stopped</option>
              <option value="on-failure">Restart: On failure</option>
            </select>
            {hasAdvanced && !advancedOpen && (
              <span className="text-[11px] text-text-tertiary">
                {advancedSummary}
              </span>
            )}
          </div>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-sm hover:bg-hover"
            aria-label={advancedOpen ? "Hide advanced options" : "Show advanced options"}
            aria-expanded={advancedOpen}
          >
            Advanced
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Collapsible advanced fields ── */}
      {advancedOpen && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdvancedField
              label="Depends on"
              placeholder="db, cache"
              value={service.depends_on}
              onChange={(v) => updateService(service.id, "depends_on", v)}
            />
            <AdvancedField
              label="Networks"
              placeholder="frontend, backend"
              value={service.networks}
              onChange={(v) => updateService(service.id, "networks", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdvancedField
              label="Volumes"
              placeholder="./data:/var/lib/mysql"
              value={service.volumes}
              onChange={(v) => updateService(service.id, "volumes", v)}
            />
            <AdvancedField
              label="Environment"
              placeholder="NODE_ENV=production,DEBUG=*"
              value={service.env}
              onChange={(v) => updateService(service.id, "env", v)}
            />
          </div>
          <AdvancedField
            label="Command override"
            placeholder="npm start"
            value={service.command}
            onChange={(v) => updateService(service.id, "command", v)}
          />
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[12px] font-medium text-text-tertiary block mb-1">
      {children}
    </label>
  );
}

function AdvancedField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
      />
    </div>
  );
}

/**
 * Memoized: only re-renders when the `service` reference changes.
 * The parent passes a fresh object via spread on each keystroke, so this
 * isolates re-renders to the single card being edited rather than
 * every service in the list.
 */
export const ServiceCard = memo(ServiceCardImpl);
