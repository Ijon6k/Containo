import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { useNotify } from "@/components/providers/NotificationProvider";
import { buildComposeYaml } from "@/lib/services/compose-yaml.service";
import {
  ServiceData,
  ComposeNetwork,
  ComposeVolume,
} from "@/lib/types";

interface YamlPreviewProps {
  services: ServiceData[];
  networks?: ComposeNetwork[];
  volumes?: ComposeVolume[];
}

/**
 * Read-only YAML preview of the current compose stack.
 *
 * Re-derives the YAML on every render via useMemo so it stays in sync
 * with the form state without parent-to-child prop wiring for the string.
 */
export function YamlPreview({ services, networks = [], volumes = [] }: YamlPreviewProps) {
  const { addToast } = useNotify();
  const [copied, setCopied] = useState(false);

  const yamlContent = useMemo(
    () => buildComposeYaml(services, networks, volumes),
    [services, networks, volumes],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    addToast("YAML copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full relative">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-surface2 hover:bg-hover text-text-secondary hover:text-text-primary rounded-sm text-sm font-medium transition-all border border-border"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-success" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="h-full bg-surface2/30 p-8 pt-14 rounded-sm font-mono text-base text-text-primary overflow-auto border border-border leading-relaxed">
        {yamlContent}
      </pre>
    </div>
  );
}
