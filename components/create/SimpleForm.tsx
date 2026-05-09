import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Cpu, 
  Database, 
  Network, 
  ShieldCheck, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Layout
} from 'lucide-react';
import { ServiceData } from '@/lib/types';

interface SimpleFormProps {
  data: ServiceData;
  onChange: (data: ServiceData) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  cliCommand: string;
  setCliCommand: (cmd: string) => void;
  deploymentMode: 'form' | 'cli';
  setDeploymentMode: (mode: 'form' | 'cli') => void;
}

export const SimpleForm = ({ 
  data, 
  onChange, 
  onDeploy, 
  isDeploying,
  cliCommand,
  setCliCommand,
  deploymentMode,
  setDeploymentMode
}: SimpleFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = (field: keyof ServiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Switcher */}
      <div className="flex bg-ui-accent p-1 rounded-md border border-ui-border self-start">
        <button 
          onClick={() => setDeploymentMode('form')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'form' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
        >
          <Layout className="w-4 h-4" />
          Form Mode
        </button>
        <button 
          onClick={() => setDeploymentMode('cli')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'cli' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
        >
          <Terminal className="w-4 h-4" />
          CLI Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {deploymentMode === 'form' ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Basic Settings */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                <Settings2 className="w-5 h-5 text-text-sub" />
                <h3 className="text-base font-semibold text-text-main">Basic Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Container Name</label>
                  <input 
                    placeholder="app-name"
                    value={data.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Image</label>
                  <input 
                    placeholder="nginx:latest"
                    value={data.image}
                    onChange={(e) => updateField('image', e.target.value)}
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Config */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                <Network className="w-5 h-5 text-text-sub" />
                <h3 className="text-base font-semibold text-text-main">Network & Environment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Ports</label>
                  <input 
                    placeholder="80:80"
                    value={data.ports}
                    onChange={(e) => updateField('ports', e.target.value)}
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Environment Variables</label>
                  <textarea 
                    placeholder="KEY=VALUE"
                    value={data.env}
                    onChange={(e) => updateField('env', e.target.value)}
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none h-24"
                  />
                </div>
              </div>
            </section>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-text-main transition-all"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvanced ? 'Fewer options' : 'More options'}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-6 bg-ui-accent/50 border border-ui-border p-6 rounded-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <Cpu className="w-4 h-4" /> CPU
                        </label>
                        <input type="number" placeholder="1024" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <Database className="w-4 h-4" /> RAM (MB)
                        </label>
                        <input type="number" placeholder="512" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Privileged
                        </label>
                        <select className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main font-semibold">
                           <option value="false">No</option>
                           <option value="true">Yes</option>
                        </select>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="cli"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
             <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                   <Terminal className="w-5 h-5 text-text-sub" />
                   <h3 className="text-base font-semibold text-text-main">Command Line</h3>
                </div>
                <p className="text-sm text-text-sub">Paste your docker run command here. The system will parse it automatically.</p>
                <textarea 
                  value={cliCommand}
                  onChange={(e) => setCliCommand(e.target.value)}
                  placeholder="docker run -d --name app ..."
                  className="w-full h-48 bg-ui-accent border border-ui-border rounded-md p-6 font-mono text-sm text-text-main focus:border-brand/50 outline-none leading-relaxed"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action */}
      <div className="pt-8 border-t border-ui-border flex justify-end">
        <button 
          onClick={onDeploy}
          disabled={isDeploying || (deploymentMode === 'form' && (!data.name || !data.image)) || (deploymentMode === 'cli' && !cliCommand)}
          className="bg-brand hover:bg-brand/90 text-white px-10 py-3 rounded-md text-sm font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-sm"
        >
          {isDeploying ? 'Deploying...' : 'Deploy Container'}
        </button>
      </div>
    </div>
  );
};
