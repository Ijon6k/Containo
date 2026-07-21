import React, { useState, useEffect } from "react";
import {
  Folder,
  FileCode,
  CornerLeftUp,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNotify } from "@/components/providers/NotificationProvider";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface DirectoryResponse {
  currentPath: string;
  parentPath: string;
  items: FileItem[];
}

interface DirectoryPickerProps {
  onSelect: (path: string) => void;
  onCancel: () => void;
  title?: string;
  initialPath?: string;
}

/**
 * Browse and select a directory on the host filesystem.
 *
 * Uses the validated /api/fs endpoint, which restricts navigation
 * to safe directories under /home, /srv, /opt, /var/lib.
 */
export function DirectoryPicker({
  onSelect,
  onCancel,
  title = "Select target directory",
  initialPath = "",
}: DirectoryPickerProps) {
  const { addToast } = useNotify();
  const [currentPath, setCurrentPath] = useState(initialPath || "");
  const [parentPath, setParentPath] = useState("/");
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDirectory(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDirectory(path: string) {
    setLoading(true);
    setError("");
    try {
      const url = path
        ? `/api/fs?path=${encodeURIComponent(path)}`
        : "/api/fs";
      const res = await fetch(url);
      const data: DirectoryResponse & { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to read directory");
      }
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setItems(data.items);
    } catch (err: any) {
      setError(err.message);
      addToast(`Cannot open directory: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      fetchDirectory(item.path);
    } else {
      // Clicking a compose file selects the parent directory
      onSelect(currentPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-md shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface2/30">
          <div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary mt-1 font-mono">
              {currentPath || "/"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-hover rounded-sm transition-colors"
            aria-label="Close directory picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Info */}
        <div className="mx-6 mt-4 p-3.5 bg-brand/5 border border-brand/10 rounded-sm flex gap-3 text-sm text-text-secondary leading-relaxed">
          <span className="shrink-0 text-brand">💡</span>
          <div>
            <span className="font-semibold text-text-primary">Tip:</span> Docker
            Compose stacks are commonly organized in a dedicated directory under
            your user home folder (e.g.,{" "}
            <code className="bg-surface2 px-1 py-0.5 rounded font-mono text-[12px]">
              ~/stacks/
            </code>{" "}
            or{" "}
            <code className="bg-surface2 px-1 py-0.5 rounded font-mono text-[12px]">
              ~/projects/
            </code>
            ). For production servers, system-wide directories like{" "}
            <code className="bg-surface2 px-1 py-0.5 rounded font-mono text-[12px]">
              /srv/docker/
            </code>{" "}
            or{" "}
            <code className="bg-surface2 px-1 py-0.5 rounded font-mono text-[12px]">
              /opt/
            </code>{" "}
            are also standard.
          </div>
        </div>

        {/* Browser Body */}
        <div className="h-96 overflow-y-auto p-2 bg-surface relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/50 backdrop-blur-[2px]">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 m-2 bg-danger-bg border border-danger/20 rounded-sm text-danger text-base">
              {error}
            </div>
          )}

          <div className="space-y-1">
            {currentPath && currentPath !== "/" && parentPath && parentPath !== currentPath && (
              <button
                onClick={() => fetchDirectory(parentPath)}
                className="w-full flex items-center gap-3 p-3 hover:bg-hover rounded-sm transition-colors text-left"
              >
                <CornerLeftUp className="w-5 h-5 text-text-secondary" />
                <span className="text-base font-semibold text-text-secondary">
                  .. (Go up to {parentPath})
                </span>
              </button>
            )}

            {items.length === 0 && !loading && !error && (
              <div className="text-center py-12 text-text-secondary text-base">
                Folder is empty
              </div>
            )}

            {items.map((item) => (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-hover rounded-sm transition-colors text-left group"
              >
                {item.isDirectory ? (
                  <Folder className="w-5 h-5 text-brand opacity-80 group-hover:opacity-100" />
                ) : (
                  <FileCode className="w-5 h-5 text-text-secondary opacity-50" />
                )}
                <span className="text-base text-text-primary truncate">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-surface2/30 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Select the current directory to proceed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-sm text-base font-semibold text-text-secondary hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(currentPath)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-sm text-base font-semibold text-white bg-brand hover:bg-brand-hover transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Select directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
