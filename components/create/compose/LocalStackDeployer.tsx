import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DirectoryPicker } from './DirectoryPicker';

interface LocalStackDeployerProps {
  onDeployExisting: (path: string) => void;
  isDeploying: boolean;
}

export const LocalStackDeployer = ({ onDeployExisting, isDeploying }: LocalStackDeployerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');

  return (
    <motion.div key="existing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-brand" />
      </div>
      
      <h3 className="text-xl font-bold text-text-main mb-3">Deploy Existing Project</h3>
      <p className="text-sm text-text-sub mb-8 leading-relaxed">
        Select a directory on the host machine that contains a <code className="bg-ui-accent px-1.5 py-0.5 rounded text-brand font-mono">docker-compose.yml</code> file to instantly deploy it.
      </p>

      {selectedPath ? (
        <div className="w-full bg-ui-accent/30 border border-ui-border p-4 rounded-lg flex items-center justify-between mb-8 shadow-sm">
          <div className="flex flex-col items-start truncate pr-4">
            <span className="text-xs font-bold text-text-sub uppercase tracking-wider mb-1">Target Directory</span>
            <span className="text-sm font-mono text-text-main truncate w-full text-left">{selectedPath}</span>
          </div>
          <button 
            onClick={() => setShowPicker(true)}
            className="text-brand hover:text-brand/80 text-sm font-semibold flex-shrink-0"
          >
            Change
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setShowPicker(true)}
          className="w-full py-4 border-2 border-dashed border-ui-border hover:border-brand/50 rounded-xl text-text-sub hover:text-brand transition-colors mb-8 flex flex-col items-center gap-2 group"
        >
          <FolderOpen className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm font-semibold">Browse Host Directory</span>
        </button>
      )}

      <button 
        onClick={() => onDeployExisting(selectedPath)}
        disabled={!selectedPath || isDeploying}
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
            Run Docker Compose
          </>
        )}
      </button>

      {showPicker && (
        <DirectoryPicker 
          title="Select Project Folder"
          onSelect={(path) => {
            setSelectedPath(path);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
          initialPath={selectedPath || ''}
        />
      )}
    </motion.div>
  );
};
