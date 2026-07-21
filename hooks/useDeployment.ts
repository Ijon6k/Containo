import { useState, useCallback, useRef, useEffect } from "react";
import { ServiceData } from "@/lib/types";
import { deployContainerStream as apiDeployContainerStream } from "@/lib/api/container-api";
import { consumeNDJSONChunk, flushNDJSONBuffer } from "@/lib/utils/sse";

type ToastFn = (msg: string, type?: "success" | "error") => void;

interface DeploymentOptions {
  /** Maximum number of log lines kept in memory. Older lines are dropped. */
  maxLogLines?: number;
}

/**
 * Hook for streaming a container deployment and exposing
 * logs / pull progress to the UI.
 *
 * Handles abort cleanup on unmount so background deploys
 * are killed if the user navigates away.
 */
export function useDeployment(addToast: ToastFn, options: DeploymentOptions = {}) {
  const maxLogLines = options.maxLogLines ?? 500;
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [pullProgress, setPullProgress] = useState<Record<string, any>>({});
  const abortRef = useRef<AbortController | null>(null);

  const appendLog = useCallback(
    (line: string) => {
      setDeploymentLogs((prev) => {
        const next = prev.length >= maxLogLines ? prev.slice(-maxLogLines + 1) : prev;
        return [...next, line];
      });
    },
    [maxLogLines],
  );

  const handleDeploy = useCallback(
    async (data: ServiceData) => {
      setIsDeploying(true);
      setDeploymentLogs(["Initializing deployment..."]);
      setDeploymentComplete(false);
      setPullProgress({});

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await apiDeployContainerStream(data);

        if (!response.ok) throw new Error("Deployment failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to read response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        // Read the stream until done or abort signal fires
        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer = consumeNDJSONChunk(buffer, chunk, (parsed, raw) => {
            handleParsedMessage(parsed, raw);
          });
        }

        // Flush any trailing partial line at end-of-stream
        flushNDJSONBuffer(buffer, (parsed, raw) => {
          handleParsedMessage(parsed, raw);
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          appendLog(`[FATAL] ${error.message}`);
          addToast(error.message, "error");
        }
      } finally {
        setIsDeploying(false);
        abortRef.current = null;
      }

      function handleParsedMessage(parsed: any, raw: string) {
        let message = "";
        switch (parsed?.type) {
          case "pull":
            message = `[PULL] ${parsed.status} ${parsed.progress || ""}`.trim();
            if (parsed.id) {
              setPullProgress((prev) => ({
                ...prev,
                [parsed.id]: {
                  status: parsed.status,
                  progressDetail: parsed.progressDetail,
                },
              }));
            }
            break;
          case "create":
            message = `[CREATE] ${parsed.message}`;
            break;
          case "success":
            message = `[SUCCESS] ${parsed.message}`;
            setDeploymentComplete(true);
            break;
          case "error":
            message = `[ERROR] ${parsed.message}`;
            addToast(parsed.message, "error");
            break;
          default:
            // Non-JSON or unknown type: forward as raw
            appendLog(raw);
            return;
        }
        if (message) appendLog(message);
      }
    },
    [addToast, appendLog],
  );

  // Cleanup: abort any in-flight deployment when the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    isDeploying,
    deploymentLogs,
    deploymentComplete,
    pullProgress,
    handleDeploy,
    setDeploymentLogs,
    setDeploymentComplete,
  };
}
