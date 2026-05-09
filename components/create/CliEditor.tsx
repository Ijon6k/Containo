import React from 'react';
import { Terminal as TerminalIcon, Copy } from 'lucide-react';

interface CliEditorProps {
  value: string;
  onChange: (value: string) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CliEditor = ({ value, onChange, onDeploy, isDeploying, addToast }: CliEditorProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    addToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-text-main">
          <TerminalIcon className="w-4 h-4 text-brand" />
          Docker Run Command
        </div>
        <button 
          onClick={handleCopy}
          className="text-[10px] font-bold text-text-sub hover:text-brand flex items-center gap-1 uppercase tracking-widest"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>

      <div className="relative group">
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-48 bg-zinc-950 text-emerald-500 font-mono text-sm p-6 rounded-xl border border-ui-border focus:border-brand/50 focus:ring-0 transition-all resize-none shadow-inner"
          placeholder="docker run -d --name my-app -p 8080:80 nginx:latest"
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-white/5 uppercase tracking-tighter">
          Bash Mode
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          onClick={onDeploy} 
          disabled={isDeploying}
          className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isDeploying && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Execute Deployment
        </button>
      </div>
    </div>
  );
};
