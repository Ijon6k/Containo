import { memo } from "react";
import { Trash2 } from "lucide-react";
import { ComposeNetwork } from "@/lib/types";

interface NetworkCardProps {
  network: ComposeNetwork;
  updateNetwork: (id: string, field: keyof ComposeNetwork, value: string | boolean) => void;
  removeNetwork: (id: string) => void;
}

function NetworkCardImpl({ network, updateNetwork, removeNetwork }: NetworkCardProps) {
  return (
    <div className="border-b border-border last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0 hover:bg-surface2/20 transition-colors -mx-5 px-5 p-4">
      <div className="flex items-center justify-between mb-3">
        <input
          value={network.name}
          onChange={(e) => updateNetwork(network.id, "name", e.target.value)}
          className="bg-transparent border-none text-base font-semibold text-text-primary focus:ring-0 p-0 w-full outline-none"
          placeholder="network-name"
        />
        <button
          onClick={() => removeNetwork(network.id)}
          className="p-1.5 hover:bg-danger-bg rounded-sm transition-all text-text-secondary hover:text-danger shrink-0 ml-2"
          aria-label={`Remove ${network.name || "network"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Driver</label>
          <select
            value={network.driver}
            onChange={(e) => updateNetwork(network.id, "driver", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary outline-none focus:border-brand/50 transition-colors"
          >
            <option value="bridge">bridge</option>
            <option value="overlay">overlay</option>
            <option value="host">host</option>
            <option value="none">none</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">External</label>
          <button
            onClick={() => updateNetwork(network.id, "external", !network.external)}
            className={`w-full border rounded-sm px-3 py-2 text-sm font-medium transition-colors outline-none ${
              network.external
                ? "bg-brand/10 border-brand/20 text-brand"
                : "bg-surface border-border text-text-secondary hover:border-border-hover"
            }`}
          >
            {network.external ? "Yes — pre-existing network" : "No — created by compose"}
          </button>
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Subnet</label>
          <input
            placeholder="172.20.0.0/16"
            value={network.subnet}
            onChange={(e) => updateNetwork(network.id, "subnet", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Gateway</label>
          <input
            placeholder="172.20.0.1"
            value={network.gateway}
            onChange={(e) => updateNetwork(network.id, "gateway", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[12px] font-medium text-text-tertiary block mb-1">Labels (comma sep.)</label>
        <input
          placeholder="env=production, tier=backend"
          value={network.labels}
          onChange={(e) => updateNetwork(network.id, "labels", e.target.value)}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

export const NetworkCard = memo(NetworkCardImpl);
