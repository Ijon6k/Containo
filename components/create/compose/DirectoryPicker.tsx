import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode, CornerLeftUp, Loader2, CheckCircle2, X } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface DirectoryPickerProps {
  onSelect: (path: string) => void;
  onCancel: () => void;
  title?: string;
  initialPath?: string;
}

export const DirectoryPicker = ({ onSelect, onCancel, title = "Select Target Directory", initialPath = "" }: DirectoryPickerProps) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [parentPath, setParentPath] = useState('/');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDirectory = async (path: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/fs?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error('Failed to read directory');
      const data = await res.json();
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setItems(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory(currentPath);
  }, []);

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      fetchDirectory(item.path);
    } else {
      // If it's a file, maybe select its parent directory or the file itself?
      // Since it's a directory picker, we usually select the folder. 
      // But if they click docker-compose.yml, we select its parent.
      onSelect(currentPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-ui-bg border border-ui-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ui-border bg-ui-accent/30">
          <div>
            <h3 className="text-lg font-bold text-text-main">{title}</h3>
            <p className="text-xs text-text-sub mt-1 font-mono">{currentPath}</p>
          </div>
          <button onClick={onCancel} className="p-2 text-text-sub hover:text-text-main hover:bg-ui-border/50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Info */}
        <div className="mx-6 mt-4 p-3.5 bg-brand/5 border border-brand/10 rounded-lg flex gap-3 text-xs text-text-sub leading-relaxed">
          <span className="shrink-0 text-brand">💡</span>
          <div>
            <span className="font-bold text-text-main">Tip:</span> Docker Compose stacks are commonly organized in a dedicated directory under your user home folder (e.g., <code className="bg-ui-accent px-1 py-0.5 rounded font-mono text-[10px]">~/stacks/</code> or <code className="bg-ui-accent px-1 py-0.5 rounded font-mono text-[10px]">~/projects/</code>). For production servers, system-wide directories like <code className="bg-ui-accent px-1 py-0.5 rounded font-mono text-[10px]">/srv/docker/</code> or <code className="bg-ui-accent px-1 py-0.5 rounded font-mono text-[10px]">/opt/</code> are also standard.
          </div>
        </div>

        {/* Browser Body */}
        <div className="h-96 overflow-y-auto p-2 bg-ui-bg relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-ui-bg/50 backdrop-blur-[2px]">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 m-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            {currentPath !== '/' && (
              <button 
                onClick={() => fetchDirectory(parentPath)}
                className="w-full flex items-center gap-3 p-3 hover:bg-ui-accent rounded-lg transition-colors text-left"
              >
                <CornerLeftUp className="w-5 h-5 text-text-sub" />
                <span className="text-sm font-semibold text-text-sub">.. (Go Up)</span>
              </button>
            )}

            {items.length === 0 && !loading && !error && (
              <div className="text-center py-12 text-text-sub text-sm">
                Folder is empty
              </div>
            )}

            {items.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-ui-accent rounded-lg transition-colors text-left group"
              >
                {item.isDirectory ? (
                  <Folder className="w-5 h-5 text-brand opacity-80 group-hover:opacity-100" />
                ) : (
                  <FileCode className="w-5 h-5 text-text-sub opacity-50" />
                )}
                <span className="text-sm text-text-main truncate">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-ui-border bg-ui-accent/30 flex items-center justify-between">
          <p className="text-xs text-text-sub">Select the current directory to proceed.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-text-sub hover:bg-ui-border transition-colors">
              Cancel
            </button>
            <button 
              onClick={() => onSelect(currentPath)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-brand hover:bg-brand/90 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Select Directory
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
