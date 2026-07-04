import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  ChevronRight,
  Square,
  XCircle,
} from "lucide-react";

interface DeploymentLogsProps {
  logs: string[];
  pullProgress: Record<string, any>;
  onClose: () => void;
  onStop?: () => void;
  isComplete: boolean;
}

const hasErrors = (logs: string[]) => logs.some((l) => l.includes("[ERROR]"));

export const DeploymentLogs = ({
  logs,
  pullProgress,
  onClose,
  onStop,
  isComplete,
}: DeploymentLogsProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const errored = hasErrors(logs);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const displayLogs = logs.filter((log) => !log.includes("[PULL]"));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ui-border pb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-md bg-ui-accent ${
              isComplete
                ? errored
                  ? "text-rose-500"
                  : "text-emerald-500"
                : "text-brand animate-pulse"
            }`}
          >
            {isComplete ? (
              errored ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-main">
              {isComplete
                ? errored
                  ? "Deployment Failed"
                  : "Deployment Finished"
                : "Deploying..."}
            </h3>
            <p className="text-sm text-text-sub">
              {isComplete
                ? errored
                  ? "docker compose exited with an error. Check the log below."
                  : "All services are up."
                : "Streaming docker compose output..."}
            </p>
          </div>
        </div>

        {!isComplete && onStop && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-md text-xs font-bold transition-all border border-rose-500/20"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        )}
      </div>

      {/* Visual Pull Progress */}
      <AnimatePresence>
        {Object.keys(pullProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            {Object.entries(pullProgress).map(([id, info]) => {
              const progress = info.progressDetail?.total
                ? (info.progressDetail.current / info.progressDetail.total) *
                  100
                : info.status === "Download complete" ||
                    info.status === "Pull complete"
                  ? 100
                  : 0;

              return (
                <div
                  key={id}
                  className="bg-ui-accent/50 px-4 py-3 rounded-md border border-ui-border flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    <span className="text-xs font-mono text-text-sub uppercase tracking-wider truncate">
                      {id}
                    </span>
                  </div>
                  <div className="flex-1 relative h-1.5 bg-ui-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                        progress === 100 ? "bg-emerald-500" : "bg-brand"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-text-sub uppercase tracking-widest px-2 py-0.5 bg-ui-bg rounded shrink-0 w-32 text-center truncate border border-ui-border/50">
                    {info.status}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Output */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-sub uppercase tracking-[0.2em]">
          <ChevronRight className="w-4 h-4" />
          Output ({displayLogs.length} lines)
        </div>
        <div
          ref={scrollRef}
          className="bg-[#0a0a0a] border border-ui-border rounded-md p-5 h-80 overflow-y-auto font-mono text-xs custom-scrollbar shadow-inner leading-relaxed"
        >
          <div className="space-y-0.5">
            {displayLogs.length === 0 && !isComplete && (
              <span className="text-text-sub opacity-50">
                Waiting for output...
              </span>
            )}
            {displayLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 group"
              >
                <span className="text-text-sub opacity-20 select-none shrink-0">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span
                  className={`${
                    log.includes("[ERROR]")
                      ? "text-rose-400"
                      : log.includes("[SUCCESS]")
                        ? "text-emerald-400"
                        : log.includes("[STOPPED]")
                          ? "text-amber-400"
                          : "text-text-main"
                  } whitespace-pre-wrap break-all`}
                >
                  {log.replace(/\[.*?\]\s*/, "")}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Close button — shows when complete or errored */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 border ${
              errored
                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20"
                : "bg-ui-accent hover:bg-ui-accent/80 text-text-main border-ui-border"
            }`}
          >
            {errored ? "Close & Fix" : "Return to Dashboard"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
