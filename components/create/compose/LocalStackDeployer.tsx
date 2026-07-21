import React, { useState } from "react";
import { FolderOpen, Play, Loader2, Search } from "lucide-react";
import { DirectoryPicker } from "./DirectoryPicker";
import { useNotify } from "@/components/providers/NotificationProvider";

interface ComposeFile {
  name: string;
  path: string;
}

interface LocalStackDeployerProps {
  onDeployExisting: (path: string, composeFile?: string) => void;
  isDeploying: boolean;
}

const COMPOSE_FILE_PATTERN = /^docker-compose.*\.(yml|yaml)$/;

/**
 * Deploy an existing docker-compose project from the host filesystem.
 *
 * Two ways to target the project directory:
 *   1. Paste the path directly into the input
 *   2. Click "browse" to use the DirectoryPicker
 *
 * When the directory contains multiple compose files, the user picks one.
 */
export function LocalStackDeployer({
  onDeployExisting,
  isDeploying,
}: LocalStackDeployerProps) {
  const { addToast } = useNotify();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [composeFiles, setComposeFiles] = useState<ComposeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");

  async function loadPath(p: string) {
    setSelectedPath(p);
    setPathInput(p);
    setSelectedFile("");
    setComposeFiles([]);
    try {
      const url = `/api/fs?path=${encodeURIComponent(p)}`;
      const res = await fetch(url);
      if (!res.ok) {
        addToast(`Cannot read directory: ${p}`, "error");
        return;
      }
      const data = await res.json();
      const files: ComposeFile[] = (data.items || [])
        .filter(
          (item: any) => !item.isDirectory && COMPOSE_FILE_PATTERN.test(item.name),
        )
        .map((item: any) => ({ name: item.name, path: item.path }));
      setComposeFiles(files);
      if (files.length > 0) setSelectedFile(files[0].name);
    } catch {
      addToast(`Failed to read directory: ${p}`, "error");
    }
  }

  const handleGo = () => {
    if (pathInput.trim()) loadPath(pathInput.trim());
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-brand" />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-3">
        Deploy existing project
      </h3>
      <p className="text-base text-text-secondary mb-6 leading-relaxed">
        Paste a path or browse to a directory containing a{" "}
        <code className="bg-surface2 px-1.5 py-0.5 rounded text-brand font-mono">
          docker-compose.yml
        </code>{" "}
        file.
      </p>

      {/* Paste path input */}
      <div className="w-full flex gap-2 mb-4">
        <input
          type="text"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGo()}
          placeholder="/home/projects/my-stack"
          className="flex-1 bg-surface border border-border rounded-sm px-4 py-3 text-base font-mono text-text-primary focus:border-brand/50 outline-none transition-colors"
        />
        <button
          onClick={handleGo}
          className="bg-surface border border-border hover:border-brand/50 text-text-primary px-4 py-3 rounded-sm text-base font-semibold transition-all flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Go
        </button>
      </div>

      <button
        onClick={() => setShowPicker(true)}
        className="w-full py-4 border-2 border-dashed border-border hover:border-brand/50 rounded-md text-text-secondary hover:text-brand transition-colors mb-6 flex flex-col items-center gap-2 group"
      >
        <FolderOpen className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="text-base font-semibold">Or browse directory</span>
      </button>

      {selectedPath && (
        <div className="w-full bg-surface2/30 border border-border rounded-sm p-4 mb-4 shadow-sm">
          <div className="flex flex-col items-start truncate">
            <span className="text-sm font-semibold text-text-secondary mb-1">
              Target directory
            </span>
            <span className="text-base font-mono text-text-primary truncate w-full text-left">
              {selectedPath}
            </span>
          </div>
        </div>
      )}

      {/* Compose file picker when multiple found */}
      {composeFiles.length > 1 && (
        <div className="w-full mb-4">
          <span className="text-sm font-semibold text-text-secondary mb-2 block text-left">
            Select compose file
          </span>
          <div className="space-y-1">
            {composeFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f.name)}
                className={`w-full text-left px-3 py-2 rounded-sm text-base font-mono transition-all ${
                  selectedFile === f.name
                    ? "bg-brand/10 border border-brand/30 text-brand"
                    : "bg-surface2/30 border border-border/50 text-text-secondary hover:text-text-primary"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warning if no compose files found but directory selected */}
      {selectedPath && composeFiles.length === 0 && (
        <div className="w-full bg-warning-bg border border-warning/20 rounded-sm p-3 mb-4">
          <span className="text-sm text-warning">
            No docker-compose file found in this directory
          </span>
        </div>
      )}

      <button
        onClick={() => onDeployExisting(selectedPath, selectedFile || undefined)}
        disabled={
          !selectedPath ||
          isDeploying ||
          (composeFiles.length > 0 && !selectedFile)
        }
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Deploying stack...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            {selectedFile ? `Run ${selectedFile}` : "Run docker compose"}
          </>
        )}
      </button>

      {showPicker && (
        <DirectoryPicker
          title="Select project folder"
          onSelect={(path) => {
            loadPath(path);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
          initialPath={selectedPath}
        />
      )}
    </div>
  );
}
