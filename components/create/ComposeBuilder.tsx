import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Box, 
  Network, 
  FileCode, 
  Terminal, 
  Layers,
  Settings2
} from 'lucide-react';
import { ServiceData } from '@/lib/types';

interface ComposeBuilderProps {
  onDeploy: (composeData: any) => void;
  isDeploying: boolean;
}

export const ComposeBuilder = ({ onDeploy, isDeploying }: ComposeBuilderProps) => {
  const [services, setServices] = useState<ServiceData[]>([
    { id: '1', name: 'web-app', image: 'nginx:alpine', ports: '8080:80', env: '', volumes: '', restartPolicy: 'always' }
  ]);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'yaml' | 'cli'>('visualizer');

  const addService = () => {
    const newId = (services.length + 1).toString();
    setServices([...services, { 
      id: newId, 
      name: `service-${newId}`, 
      image: '', 
      ports: '', 
      env: '', 
      volumes: '', 
      restartPolicy: 'no' 
    }]);
  };

  const updateService = (id: string, field: keyof ServiceData, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const generateYaml = () => {
    let yaml = "version: '3.8'\n\nservices:\n";
    services.forEach(s => {
      yaml += `  ${s.name}:\n`;
      yaml += `    image: ${s.image || 'no-image'}\n`;
      if (s.ports) yaml += `    ports:\n      - "${s.ports}"\n`;
      if (s.restartPolicy) yaml += `    restart: ${s.restartPolicy}\n`;
      if (s.env) {
        yaml += `    environment:\n`;
        s.env.split(',').forEach(e => yaml += `      - ${e.trim()}\n`);
      }
      if (s.volumes) {
        yaml += `    volumes:\n`;
        s.volumes.split(',').forEach(v => yaml += `      - ${v.trim()}\n`);
      }
    });
    return yaml;
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] flex-1">
        {/* Left: Service Configuration */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h3 className="text-lg font-semibold text-text-main flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand" />
              Service Units
            </h3>
            <button 
              onClick={addService}
              className="text-sm font-semibold text-brand hover:text-brand/80 transition-all flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-md"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-ui-bg border border-ui-border rounded-lg p-6 space-y-5 group hover:border-brand/30 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <input 
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    className="bg-transparent border-none text-base font-semibold text-text-main focus:ring-0 p-0 w-full"
                    placeholder="service-name"
                  />
                  <button 
                    onClick={() => removeService(service.id)} 
                    className="p-2 hover:bg-rose-500/10 rounded-md transition-all text-text-sub hover:text-rose-500"
                    title="Remove Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Container Image</label>
                    <input 
                      placeholder="nginx:alpine"
                      value={service.image}
                      onChange={(e) => updateService(service.id, 'image', e.target.value)}
                      className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Exposed Ports</label>
                      <input 
                        placeholder="80:80"
                        value={service.ports}
                        onChange={(e) => updateService(service.id, 'ports', e.target.value)}
                        className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Restart Policy</label>
                      <select 
                        value={service.restartPolicy}
                        onChange={(e) => updateService(service.id, 'restartPolicy', e.target.value)}
                        className="w-full bg-ui-accent border border-ui-border rounded-md px-3 py-2.5 text-xs font-semibold text-text-main outline-none focus:border-brand/50 transition-colors"
                      >
                        <option value="no">No</option>
                        <option value="always">Always</option>
                        <option value="unless-stopped">Unless Stopped</option>
                        <option value="on-failure">On Failure</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visualizer & Source Area */}
        <div className="flex-1 bg-ui-bg border border-ui-border rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="flex bg-ui-accent/50 border-b border-ui-border">
            {[
              { id: 'visualizer', label: 'Network View', icon: Box },
              { id: 'yaml', label: 'YAML Source', icon: FileCode },
              { id: 'cli', label: 'CLI Import', icon: Terminal },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-ui-bg text-brand border-b-2 border-brand' : 'text-text-sub hover:bg-ui-accent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'visualizer' && (
                <motion.div 
                  key="viz" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center space-y-12"
                >
                  <div className="flex items-center gap-3 px-5 py-2 bg-ui-accent border border-ui-border rounded-full shadow-sm">
                    <Network className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Stack Internal Network</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                    {services.map((s) => (
                      <div key={s.id} className="p-5 bg-ui-bg border border-ui-border rounded-lg flex items-center gap-4 shadow-sm group hover:border-brand/40 transition-all">
                        <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                          <Box className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-main truncate uppercase tracking-tight">{s.name}</p>
                          <p className="text-xs font-mono text-text-sub truncate opacity-60 mt-1">{s.image || 'no-image-selected'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'yaml' && (
                <motion.div key="yaml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                  <pre className="h-full bg-ui-accent/30 p-8 rounded-lg font-mono text-sm text-text-main overflow-auto border border-ui-border leading-relaxed">
                    {generateYaml()}
                  </pre>
                </motion.div>
              )}

              {activeTab === 'cli' && (
                <motion.div key="cli" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
                  <div className="flex-1 bg-ui-accent/30 p-8 rounded-lg border border-ui-border flex flex-col">
                    <textarea 
                      placeholder="Paste docker-compose.yml or docker run command here for analysis..."
                      className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-sm text-text-main placeholder:text-text-sub/30 leading-relaxed"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer: Deployment Summary */}
      <div className="flex items-center justify-between p-8 bg-ui-accent/30 border border-ui-border rounded-xl mt-auto shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-ui-bg rounded-lg border border-ui-border">
            <Settings2 className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-main">Stack architecture verified</p>
            <p className="text-sm text-text-sub">{services.length} internal services defined in local registry.</p>
          </div>
        </div>
        <button 
          onClick={() => onDeploy(services)}
          disabled={isDeploying}
          className="bg-brand hover:bg-brand/90 text-white px-12 py-4 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isDeploying ? 'Deploying Stack...' : 'Deploy Infrastructure'}
        </button>
      </div>
    </div>
  );
};
