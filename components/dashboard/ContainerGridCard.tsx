import React from "react";
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Trash2,
  ExternalLink,
  ScrollText,
  Cpu,
  Layers,
  Network,
  Box,
} from "lucide-react";
import { Container, ContainerStats } from "@/lib/types";
import { parseContainerPorts } from "@/lib/utils/network";

interface ContainerGridCardProps {
  container: Container;
  stats: ContainerStats | null;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onOpenTerminal: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

export const ContainerGridCard = ({
  container: c,
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onOpenTerminal,
  onDelete,
  onOpenWebUI,
}: ContainerGridCardProps) => {
  const isRunning = c.status === "running";
  const cpuVal = stats?.cpuPercentage || 0;
  const memVal = stats?.memoryPercentage || 0;

  return (
    <div className="group bg-surface border border-border rounded-md hover:border-border-hover transition-colors overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isRunning ? "bg-success" : "bg-text-tertiary"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                isRunning ? "text-success" : "text-text-tertiary"
              }`}
            >
              {c.status}
            </span>
          </div>
          <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
            {c.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Box className="w-3 h-3 text-text-tertiary" />
            <span className="text-[12px] font-mono text-text-tertiary truncate">
              {c.image}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-text-tertiary shrink-0">
          {c.id.substring(0, 8)}
        </span>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 flex-1">
        {isRunning ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3 h-3 text-brand" />
                  <span className="text-[11px] text-text-tertiary">CPU</span>
                  <span className="text-[12px] font-mono font-medium text-text-primary ml-auto">
                    {cpuVal.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cpuVal, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3 h-3 text-success" />
                  <span className="text-[11px] text-text-tertiary">MEM</span>
                  <span className="text-[12px] font-mono font-medium text-text-primary ml-auto">
                    {memVal.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(memVal, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1 text-text-tertiary">
                <Network className="w-3 h-3" />
                <span className="font-mono">
                  {(stats?.networkRxMB || 0).toFixed(0)}MB
                </span>
              </div>
              <div className="text-[11px] font-mono truncate flex items-center gap-1">
                {parseContainerPorts(c).length === 0 ? (
                  <span className="text-text-tertiary">{c.ports || "—"}</span>
                ) : (
                  parseContainerPorts(c).map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-text-tertiary/40">,</span>}
                      {item.isHostExposed && isRunning ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand hover:underline font-semibold transition-colors inline-flex items-center gap-0.5 leading-none"
                          title={`Open ${item.url} in new tab`}
                        >
                          <span>{item.raw}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-brand/80 shrink-0 -translate-y-[1px]" />
                        </a>
                      ) : (
                        <span className="text-text-tertiary">{item.raw}</span>
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[88px] flex items-center justify-center rounded-sm bg-hover">
            <span className="text-[12px] text-text-tertiary">Stopped</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border px-2 py-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onToggleStatus(c.id)}
            className={`p-1.5 rounded-md transition-colors ${
              isRunning
                ? "text-text-tertiary hover:text-warning hover:bg-hover"
                : "text-text-tertiary hover:text-success hover:bg-hover"
            }`}
            aria-label={isRunning ? "Stop" : "Start"}
          >
            {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onRestart(c.id, c.name)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors"
            aria-label="Restart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {isRunning && c.hostPorts.length > 0 && (
            <button
              onClick={() => onOpenWebUI(c)}
              className="p-1.5 rounded-md text-success hover:bg-success-bg transition-colors"
              aria-label="Open web UI"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onOpenLogs(c)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors"
            aria-label="Logs"
          >
            <ScrollText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onOpenTerminal(c)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors"
            aria-label="Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(c)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
