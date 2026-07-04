import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Play, Loader2, Search } from "lucide-react";
import { DirectoryPicker } from "./DirectoryPicker";

interface ComposeFile {
  name: string;
  path: string;
}

interface LocalStackDeployerProps {
  onDeployExisting: (path: string, composeFile?: string) => void;
  isDeploying: boolean;
}

export const LocalStackDeployer = ({
  onDeployExisting,
  isDeploying,
}: LocalStackDeployerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [composeFiles, setComposeFiles] = useState<ComposeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");

  const applyPath = (p: string) => {
    setSelectedPath(p);
    setPathInput(p);
    setSelectedFile("");
    // Auto-detect compose files in this directory
    fetch(`/api/fs?path=${encodeURIComponent(p)}`)
      .then((r) => r.json())
      .then((data) => {
        const files: ComposeFile[] = (data.items || [])
          .filter(
            (item: any) =>
              !item.isDirectory &&
              /^docker-compose.*\.(yml|yaml)$/.test(item.name),
          )
          .map((item: any) => ({ name: item.name, path: item.path }));
        setComposeFiles(files);
        if (files.length === 1 && files[0].name === "docker-compose.yml") {
          setSelectedFile(files[0].name);
        } else if (files.length === 1) {
          setSelectedFile(files[0].name);
        }
      })
      .catch(() => setComposeFiles([]));
  };

  const handleGo = () => {
    if (pathInput.trim()) applyPath(pathInput.trim());
  };

  return (
    <motion.div
      key="existing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-brand" />
      </div>

      <h3 className="text-xl font-bold text-text-main mb-3">
        Deploy Existing Project
      </h3>
      <p className="text-sm text-text-sub mb-6 leading-relaxed">
        Paste a path or browse to a directory containing a{" "}
        <code className="bg-ui-accent px-1.5 py-0.5 rounded text-brand font-mono">
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
          className="flex-1 bg-ui-bg border border-ui-border rounded-lg px-4 py-3 text-sm font-mono text-text-main focus:border-brand/50 outline-none transition-colors"
        />
        <button
          onClick={handleGo}
          className="bg-ui-bg border border-ui-border hover:border-brand/50 text-text-main px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Go
        </button>
      </div>

      <button
        onClick={() => setShowPicker(true)}
        className="w-full py-4 border-2 border-dashed border-ui-border hover:border-brand/50 rounded-xl text-text-sub hover:text-brand transition-colors mb-6 flex flex-col items-center gap-2 group"
      >
        <FolderOpen className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="text-sm font-semibold">Or Browse Directory</span>
      </button>

      {selectedPath && (
        <div className="w-full bg-ui-accent/30 border border-ui-border p-4 rounded-lg mb-4 shadow-sm">
          <div className="flex flex-col items-start truncate">
            <span className="text-xs font-bold text-text-sub uppercase tracking-wider mb-1">
              Target Directory
            </span>
            <span className="text-sm font-mono text-text-main truncate w-full text-left">
              {selectedPath}
            </span>
          </div>
        </div>
      )}

      {/* Compose file picker when multiple found */}
      {composeFiles.length > 1 && (
        <div className="w-full mb-4">
          <span className="text-xs font-bold text-text-sub uppercase tracking-wider mb-2 block text-left">
            Select Compose File
          </span>
          <div className="space-y-1">
            {composeFiles.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFile(f.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono transition-all ${
                  selectedFile === f.name
                    ? "bg-brand/10 border border-brand/30 text-brand"
                    : "bg-ui-accent/30 border border-ui-border/50 text-text-sub hover:text-text-main"
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
        <div className="w-full bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mb-4">
          <span className="text-xs text-amber-500">
            No docker-compose file found in this directory
          </span>
        </div>
      )}

      <button
        onClick={() =>
          onDeployExisting(selectedPath, selectedFile || undefined)
        }
        disabled={
          !selectedPath ||
          isDeploying ||
          (composeFiles.length > 0 && !selectedFile)
        }
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white px-8 py-3.5 rounded-lg font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Deploying Stack...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            {selectedFile ? `Run ${selectedFile}` : "Run Docker Compose"}
          </>
        )}
      </button>

      {showPicker && (
        <DirectoryPicker
          title="Select Project Folder"
          onSelect={(path) => {
            applyPath(path);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
          initialPath={selectedPath || ""}
        />
      )}
    </motion.div>
  );
};
