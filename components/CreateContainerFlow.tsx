'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Box, 
  ChevronRight,
  Layers,
  Code,
  FileText,
  Terminal as TerminalIcon,
  Copy,
  Plus,
  Trash2,
  Network,
  ChevronDown
} from 'lucide-react';

interface CreateContainerFlowProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

type CreateMode = 'selection' | 'simple' | 'compose' | null;

interface ServiceData {
  id: string;
  name: string;
  image: string;
  ports: string;
  env: string;
  volumes: string;
  restartPolicy: string;
}

export default function CreateContainerFlow({ isOpen, onClose, addToast }: CreateContainerFlowProps) {
  const [createMode, setCreateMode] = useState<CreateMode>('selection');
  const [composePreviewTab, setComposePreviewTab] = useState<'yaml' | 'cli' | 'visualizer'>('visualizer');
  
  // Simple Mode State
  const [simpleData, setSimpleData] = useState<ServiceData>({
    id: '1', name: '', image: '', ports: '', env: '', volumes: '', restartPolicy: 'unless-stopped'
  });

  // Compose Mode State (Array of services)
  const [composeServices, setComposeServices] = useState<ServiceData[]>([
    { id: '1', name: 'web', image: 'nginx:alpine', ports: '8080:80', env: '', volumes: '', restartPolicy: 'always' }
  ]);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setCreateMode('selection');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  const generateDockerRun = () => {
    let cmd = `docker run -d \\\n`;
    if (simpleData.name) cmd += `  --name ${simpleData.name} \\\n`;
    if (simpleData.ports) cmd += `  -p ${simpleData.ports} \\\n`;
    if (simpleData.restartPolicy !== 'no') cmd += `  --restart ${simpleData.restartPolicy} \\\n`;
    
    simpleData.env.split('\n').filter(Boolean).forEach(e => {
      cmd += `  -e ${e} \\\n`;
    });
    simpleData.volumes.split('\n').filter(Boolean).forEach(v => {
      cmd += `  -v ${v} \\\n`;
    });
    cmd += `  ${simpleData.image || 'nginx:latest'}`;
    return cmd;
  };

  const generateComposeYaml = () => {
    let yaml = `version: '3.8'\nservices:\n`;
    composeServices.forEach(srv => {
      yaml += `  ${srv.name || 'unnamed-service'}:\n`;
      yaml += `    image: ${srv.image || 'nginx:latest'}\n`;
      yaml += `    restart: ${srv.restartPolicy}\n`;
      if (srv.ports) {
        yaml += `    ports:\n      - "${srv.ports}"\n`;
      }
      if (srv.env) {
        yaml += `    environment:\n`;
        srv.env.split('\n').filter(Boolean).forEach(e => {
          yaml += `      - ${e}\n`;
        });
      }
      if (srv.volumes) {
        yaml += `    volumes:\n`;
        srv.volumes.split('\n').filter(Boolean).forEach(v => {
          yaml += `      - ${v}\n`;
        });
      }
    });
    return yaml;
  };

  const addComposeService = () => {
    setComposeServices([
      ...composeServices, 
      { id: Date.now().toString(), name: `service-${composeServices.length + 1}`, image: '', ports: '', env: '', volumes: '', restartPolicy: 'always' }
    ]);
  };

  const updateComposeService = (id: string, field: keyof ServiceData, value: string) => {
    setComposeServices(composeServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeComposeService = (id: string) => {
    if (composeServices.length > 1) {
      setComposeServices(composeServices.filter(s => s.id !== id));
    } else {
      addToast('Compose must have at least one service', 'error');
    }
  };

  const dockerRunCmd = generateDockerRun();
  const composeYaml = generateComposeYaml();
  const composeCliCmd = `docker-compose up -d`;

  return (
    <>
      {/* Create New Selection Modal */}
      <AnimatePresence>
        {createMode === 'selection' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md p-6 overflow-hidden shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-main">Create New Deployment</h3>
                <button onClick={onClose} className="p-1 hover:bg-ui-accent rounded-md text-text-sub transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setCreateMode('simple')}
                  className="flex flex-col items-center justify-center p-6 gap-3 rounded-lg border border-ui-border bg-ui-bg hover:border-brand hover:bg-brand/5 transition-all text-center group"
                >
                  <div className="p-3 rounded-full bg-ui-accent group-hover:bg-brand/10 text-brand">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-main text-sm">Simple Container</div>
                    <div className="text-xs text-text-sub mt-1">Single service (docker run)</div>
                  </div>
                </button>
                <button 
                  onClick={() => setCreateMode('compose')}
                  className="flex flex-col items-center justify-center p-6 gap-3 rounded-lg border border-ui-border bg-ui-bg hover:border-accent hover:bg-accent/10 transition-all text-center group"
                >
                  <div className="p-3 rounded-full bg-ui-accent group-hover:bg-accent/20 text-accent">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-main text-sm">Docker Compose</div>
                    <div className="text-xs text-text-sub mt-1">Multi-container stack</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer for Simple & Compose */}
      <AnimatePresence>
        {(createMode === 'simple' || createMode === 'compose') && (
          <div className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-5xl bg-ui-bg border-l border-ui-border shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-ui-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCreateMode('selection')}
                    className="p-1.5 hover:bg-ui-accent rounded-md text-text-sub transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                    {createMode === 'simple' ? <Box className="w-5 h-5 text-brand" /> : <Layers className="w-5 h-5 text-accent" />}
                    {createMode === 'simple' ? 'Deploy Simple Container' : 'Compose Stack Builder'}
                  </h3>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-ui-accent rounded-md text-text-sub transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              {/* Drawer Body (Split View) */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* LEFT: Form */}
                <div className="w-full md:w-[42%] p-6 overflow-y-auto custom-scrollbar border-r border-ui-border space-y-6">
                  
                  {createMode === 'simple' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-brand/5 border border-brand/20 mb-6">
                        <h4 className="text-sm font-semibold text-brand mb-1">Single Container Deployment</h4>
                        <p className="text-xs text-text-sub">Define the parameters for a single isolated Docker container. This will generate a standard docker run command.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Container Name</label>
                        <input type="text" placeholder="e.g. my-nginx" value={simpleData.name} onChange={e => setSimpleData({...simpleData, name: e.target.value})} className="w-full input-field py-2 px-3 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Image</label>
                        <input type="text" placeholder="e.g. nginx:latest" value={simpleData.image} onChange={e => setSimpleData({...simpleData, image: e.target.value})} className="w-full input-field py-2 px-3 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Port Mapping</label>
                          <input type="text" placeholder="8080:80" value={simpleData.ports} onChange={e => setSimpleData({...simpleData, ports: e.target.value})} className="w-full input-field py-2 px-3 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Restart Policy</label>
                          <div className="relative">
                            <select value={simpleData.restartPolicy} onChange={e => setSimpleData({...simpleData, restartPolicy: e.target.value})} className="w-full input-field py-2 px-3 text-sm bg-ui-bg appearance-none pr-10 cursor-pointer">
                              <option value="always">Always Restart</option>
                              <option value="unless-stopped">Unless Stopped</option>
                              <option value="on-failure">On Failure</option>
                              <option value="no">Never</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-text-sub absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Environment Variables (KEY=VALUE)</label>
                        <textarea placeholder="NODE_ENV=production\nPORT=80" value={simpleData.env} onChange={e => setSimpleData({...simpleData, env: e.target.value})} className="w-full input-field py-2 px-3 text-sm min-h-[80px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Volumes (host:container)</label>
                        <textarea placeholder="/host/path:/container/path" value={simpleData.volumes} onChange={e => setSimpleData({...simpleData, volumes: e.target.value})} className="w-full input-field py-2 px-3 text-sm min-h-[80px]" />
                      </div>
                    </div>
                  )}

                  {createMode === 'compose' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mb-6 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-semibold text-accent mb-1">Multi-Service Stack</h4>
                          <p className="text-xs text-text-sub">Add multiple services to be deployed together via docker-compose.</p>
                        </div>
                        <button onClick={addComposeService} className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Service
                        </button>
                      </div>

                      <div className="space-y-6">
                        {composeServices.map((srv, index) => (
                          <div key={srv.id} className="p-5 rounded-xl border border-ui-border bg-ui-accent/5 relative hover:border-accent/30 transition-colors shadow-sm">
                            <button 
                              onClick={() => removeComposeService(srv.id)}
                              className="absolute top-4 right-4 p-2 text-text-sub hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remove Service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <h5 className="text-base font-bold text-text-main mb-5 flex items-center gap-2">
                              <div className="p-2 bg-accent/20 rounded-md text-accent">
                                <Box className="w-4 h-4" />
                              </div>
                              Service #{index + 1}
                            </h5>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Service Name</label>
                                <input type="text" placeholder="e.g. database" value={srv.name} onChange={e => updateComposeService(srv.id, 'name', e.target.value)} className="w-full input-field py-2 px-3 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Docker Image</label>
                                <input type="text" placeholder="e.g. postgres:15-alpine" value={srv.image} onChange={e => updateComposeService(srv.id, 'image', e.target.value)} className="w-full input-field py-2 px-3 text-sm" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Port Mapping (Host:Container)</label>
                                  <input type="text" placeholder="5432:5432" value={srv.ports} onChange={e => updateComposeService(srv.id, 'ports', e.target.value)} className="w-full input-field py-2 px-3 text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Restart Policy</label>
                                  <div className="relative">
                                    <select value={srv.restartPolicy} onChange={e => updateComposeService(srv.id, 'restartPolicy', e.target.value)} className="w-full input-field py-2 px-3 text-sm bg-ui-bg appearance-none pr-10 cursor-pointer">
                                      <option value="always">Always Restart</option>
                                      <option value="unless-stopped">Unless Stopped</option>
                                      <option value="on-failure">On Failure</option>
                                      <option value="no">Never Restart</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-text-sub absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Environment Variables</label>
                                <textarea placeholder="POSTGRES_PASSWORD=secret&#10;POSTGRES_USER=admin" value={srv.env} onChange={e => updateComposeService(srv.id, 'env', e.target.value)} className="w-full input-field py-2 px-3 text-sm min-h-[80px]" title="Environment Variables" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Volumes (Host:Container)</label>
                                <textarea placeholder="./data:/var/lib/postgresql/data" value={srv.volumes} onChange={e => updateComposeService(srv.id, 'volumes', e.target.value)} className="w-full input-field py-2 px-3 text-sm min-h-[80px]" title="Volumes" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Live Preview */}
                <div className="w-full md:w-[58%] bg-zinc-950 flex flex-col relative border-l border-zinc-800">
                  {/* Tabs for Compose Mode */}
                  {createMode === 'compose' && (
                    <div className="flex px-4 pt-4 gap-2 border-b border-zinc-800 overflow-x-auto custom-scrollbar items-center">
                      <button 
                        onClick={() => setComposePreviewTab('visualizer')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${composePreviewTab === 'visualizer' ? 'border-accent text-accent' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Network className="w-4 h-4" />
                        Stack Visualizer
                      </button>
                      <button 
                        onClick={() => setComposePreviewTab('yaml')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${composePreviewTab === 'yaml' ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <FileText className="w-4 h-4" />
                        docker-compose.yml
                      </button>
                      <button 
                        onClick={() => setComposePreviewTab('cli')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${composePreviewTab === 'cli' ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <TerminalIcon className="w-4 h-4" />
                        CLI Execution
                      </button>

                      {composePreviewTab !== 'visualizer' && (
                        <button 
                          onClick={() => handleCopy(composePreviewTab === 'yaml' ? composeYaml : composeCliCmd)} 
                          className="ml-auto mb-2 p-1.5 text-zinc-500 hover:text-brand transition-colors bg-zinc-900 rounded-md border border-zinc-800 hover:bg-zinc-800 flex items-center gap-1.5 text-xs px-3"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Header for Simple Mode */}
                  {createMode === 'simple' && (
                    <div className="flex px-4 py-3 border-b border-zinc-800 text-zinc-400 text-sm items-center justify-between font-medium">
                      <div className="flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4" />
                        Generated CLI Command
                      </div>
                      <button onClick={() => handleCopy(dockerRunCmd)} className="text-zinc-500 hover:text-brand transition-colors flex items-center gap-1 text-xs">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  )}
                  
                  {/* Copy Button for Compose (Old location removed) */}

                  <div className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-relaxed custom-scrollbar">
                    {createMode === 'simple' ? (
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                        <span className="text-emerald-400">docker</span> <span className="text-accent">run</span> -d \
{simpleData.name && `\n  --name ${simpleData.name} \\`}
{simpleData.ports && `\n  -p ${simpleData.ports} \\`}
{simpleData.restartPolicy !== 'no' && `\n  --restart ${simpleData.restartPolicy} \\`}
{simpleData.env.split('\n').filter(Boolean).map(e => `\n  -e ${e} \\`).join('')}
{simpleData.volumes.split('\n').filter(Boolean).map(v => `\n  -v ${v} \\`).join('')}
{`\n  `}
<span className="text-brand">{simpleData.image || 'nginx:latest'}</span>
                      </pre>
                    ) : (
                      composePreviewTab === 'visualizer' ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] h-full p-8 font-sans">
                          <div className="px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold flex items-center gap-3 mb-12 shadow-lg shadow-accent/10">
                            <Network className="w-5 h-5" /> default_network
                          </div>
                          <div className="flex flex-wrap justify-center gap-8 relative w-full">
                            {/* Connecting lines container */}
                            {composeServices.length > 0 && (
                              <>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-accent/30 -mt-6" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-accent/30 -mt-6" />
                              </>
                            )}

                            {composeServices.map((srv, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={srv.id} 
                                className="relative p-5 rounded-xl bg-ui-bg border border-ui-border flex flex-col items-center min-w-[160px] shadow-md group hover:border-accent/50 transition-colors"
                              >
                                {/* Line connecting upwards to the horizontal line */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-accent/30 group-hover:bg-accent/50 transition-colors" />
                                
                                <div className="w-12 h-12 rounded-full bg-ui-accent/50 flex items-center justify-center mb-3 text-zinc-400 group-hover:text-accent transition-colors">
                                  <Box className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-text-main text-sm text-center mb-1 max-w-[140px] truncate" title={srv.name}>{srv.name || 'unnamed'}</div>
                                <div className="text-[10px] text-text-sub px-2.5 py-1 rounded-md bg-ui-accent max-w-[140px] truncate" title={srv.image}>{srv.image || 'No image'}</div>
                                {srv.ports && (
                                  <div className="mt-3 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                    {srv.ports}
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : composePreviewTab === 'yaml' ? (
                        <textarea 
                          readOnly
                          className="w-full h-full bg-transparent resize-none outline-none text-zinc-300 font-mono text-sm leading-relaxed"
                          value={composeYaml}
                        />
                      ) : (
                        <div className="text-zinc-300">
                          <p className="text-zinc-500 mb-4 text-xs font-sans">// Run this command in the directory containing your docker-compose.yml file</p>
                          <span className="text-emerald-400">docker-compose</span> up -d
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              
              {/* Drawer Footer */}
              <div className="p-4 border-t border-ui-border flex justify-end gap-3 bg-ui-bg">
                <button onClick={onClose} className="btn-secondary px-6 py-2">Cancel</button>
                <button 
                  onClick={() => {
                    addToast('Deployment started...', 'success');
                    onClose();
                  }} 
                  className="btn-primary px-6 py-2 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Deploy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
