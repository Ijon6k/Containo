import { memo } from "react";
import { Trash2 } from "lucide-react";
import { ComposeVolume } from "@/lib/types";

interface VolumeCardProps {
  volume: ComposeVolume;
  updateVolume: (id: string, field: keyof ComposeVolume, value: string) => void;
  removeVolume: (id: string) => void;
}

function VolumeCardImpl({ volume, updateVolume, removeVolume }: VolumeCardProps) {
  const isNamed = volume.type === "named";

  return (
    <div className="border-b border-border last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0 hover:bg-surface2/20 transition-colors -mx-5 px-5 p-4">
      <div className="flex items-center justify-between mb-3">
        <input
          value={volume.name}
          onChange={(e) => updateVolume(volume.id, "name", e.target.value)}
          className="bg-transparent border-none text-base font-semibold text-text-primary focus:ring-0 p-0 w-full outline-none"
          placeholder="volume-name"
        />
        <button
          onClick={() => removeVolume(volume.id)}
          className="p-1.5 hover:bg-danger-bg rounded-sm transition-all text-text-secondary hover:text-danger shrink-0 ml-2"
          aria-label={`Remove ${volume.name || "volume"}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Type</label>
          <button
            onClick={() => updateVolume(volume.id, "type", isNamed ? "bind" : "named")}
            className={`w-full border rounded-sm px-3 py-2 text-sm font-medium transition-colors outline-none ${
              isNamed
                ? "bg-brand/10 border-brand/20 text-brand"
                : "bg-surface border-border text-text-secondary hover:border-border-hover"
            }`}
          >
            {isNamed ? "Named volume" : "Bind mount"}
          </button>
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Driver</label>
          <input
            placeholder="local"
            value={volume.driver}
            onChange={(e) => updateVolume(volume.id, "driver", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">
            {isNamed ? "Volume name" : "Host path"}
          </label>
          <input
            placeholder={isNamed ? "my-data" : "./data"}
            value={volume.source}
            onChange={(e) => updateVolume(volume.id, "source", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-tertiary block mb-1">Container path</label>
          <input
            placeholder="/var/lib/mysql"
            value={volume.target}
            onChange={(e) => updateVolume(volume.id, "target", e.target.value)}
            className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[12px] font-medium text-text-tertiary block mb-1">Labels (comma sep.)</label>
        <input
          placeholder="backup=true"
          value={volume.labels}
          onChange={(e) => updateVolume(volume.id, "labels", e.target.value)}
          className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand/50 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

export const VolumeCard = memo(VolumeCardImpl);
