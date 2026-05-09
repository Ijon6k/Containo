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
  const [simpleData, setSimpleData] = useState<ServiceData>({
    id: '1', name: '', image: '', ports: '', env: '', volumes: '', restartPolicy: 'unless-stopped'
  });
  const [composeServices, setComposeServices] = useState<ServiceData[]>([
    { id: '1', name: 'web', image: 'nginx:alpine', ports: '8080:80', env: '', volumes: '', restartPolicy: 'always' }
  ]);

  const [isCliMode, setIsCliMode] = useState(false);
  const [cliCommand, setCliCommand] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [pullProgress, setPullProgress] = useState<Record<string, any>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper Functions (Define before Use)
  const generateDockerRun = (data: ServiceData) => {
    let cmd = `docker run -d`;
    if (data.name) cmd += ` --name ${data.name}`;
    if (data.ports) cmd += ` -p ${data.ports}`;
    if (data.restartPolicy && data.restartPolicy !== 'no') cmd += ` --restart ${data.restartPolicy}`;
    
    data.env.split('\n').filter(Boolean).forEach(e => {
      cmd += ` -e ${e}`;
    });
    data.volumes.split('\n').filter(Boolean).forEach(v => {
      cmd += ` -v ${v}`;
    });
    cmd += ` ${data.image || 'nginx:latest'}`;
    return cmd;
  };

  const parseDockerRun = (cmd: string) => {
    const data: ServiceData = {
      id: '1', name: '', image: '', ports: '', env: '', volumes: '', restartPolicy: 'unless-stopped'
    };
    
    // Split by whitespace and filter out empty strings
    const parts = cmd.trim().split(/\s+/);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '--name' && parts[i+1]) data.name = parts[++i];
      if (part === '-p' && parts[i+1]) data.ports = parts[++i];
      if (part === '--restart' && parts[i+1]) data.restartPolicy = parts[++i];
      if (part === '-e' && parts[i+1]) data.env += (data.env ? '\n' : '') + parts[++i];
      if (part === '-v' && parts[i+1]) data.volumes += (data.volumes ? '\n' : '') + parts[++i];
    }
    
    // The image is usually the last part that doesn't start with a hyphen
    // We search from the end to be more accurate
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p && !p.startsWith('-') && p !== 'run' && p !== 'docker' && p !== '-d') {
        data.image = p;
        break;
      }
    }
    
    return data;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  // Sync Form -> CLI
  React.useEffect(() => {
    if (!isCliMode) {
      setCliCommand(generateDockerRun(simpleData));
    }
  }, [simpleData, isCliMode]);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setCreateMode('selection');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sync CLI -> Form
  const handleCliChange = (val: string) => {
    setCliCommand(val);
    const parsed = parseDockerRun(val);
    setSimpleData(parsed);
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

  const dockerRunCmd = generateDockerRun(simpleData);
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
                      <div className="p-4 rounded-lg bg-brand/5 border border-brand/20 mb-6 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-semibold text-brand mb-1">Single Container Deployment</h4>
                          <p className="text-xs text-text-sub">Define parameters or use the CLI editor for direct command input.</p>
                        </div>
                        <button 
                          onClick={() => setIsCliMode(!isCliMode)}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            isCliMode ? 'bg-brand text-white' : 'bg-ui-accent text-text-sub hover:text-text-main'
                          }`}
                        >
                          <TerminalIcon className="w-3.5 h-3.5" />
                          CLI Mode: {isCliMode ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {isCliMode ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Docker Run Command</label>
                          <textarea 
                            value={cliCommand}
                            onChange={(e) => handleCliChange(e.target.value)}
                            className="w-full input-field py-3 px-4 text-sm font-mono min-h-[200px] bg-zinc-950 border-zinc-800 focus:border-brand"
                            placeholder="docker run -d --name my-app -p 80:80 nginx"
                          />
                          <p className="text-[10px] text-text-sub italic">Modifying this command will automatically sync with the form fields below.</p>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  )}

                  {createMode === 'compose' && (
// ... (rest of the file update)
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
                  onClick={async () => {
                    const data = createMode === 'simple' ? simpleData : composeServices[0];
                    setIsDeploying(true);
                    setDeployLogs(['Starting deployment...']);
                    setPullProgress({});

                    try {
                      const res = await fetch('/api/containers/deploy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });

                      if (!res.body) throw new Error('No response body');
                      const reader = res.body.getReader();
                      const decoder = new TextDecoder();
                      let buffer = '';

                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                          if (!line) continue;
                          const event = JSON.parse(line);
                          
                          if (event.type === 'pull' && event.id) {
                            setPullProgress(prev => ({
                              ...prev,
                              [event.id]: {
                                status: event.status,
                                progress: event.progress,
                                detail: event.progressDetail
                              }
                            }));
                          } else if (event.message) {
                            setDeployLogs(prev => [...prev, event.message]);
                            if (event.status === 'success') {
                              addToast('Deployment successful!', 'success');
                              setTimeout(() => {
                                setIsDeploying(false);
                                onClose();
                              }, 2000);
                            }
                            if (event.status === 'error') {
                              addToast(event.message, 'error');
                              setIsDeploying(false);
                            }
                          }
                        }
                      }
                    } catch (e: any) {
                      addToast(e.message || 'Deployment failed', 'error');
                      setIsDeploying(false);
                    }
                  }} 
                  disabled={isDeploying}
                  className="btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isDeploying ? 'animate-pulse' : ''}`} />
                  {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deployment Progress Modal */}
      <AnimatePresence>
        {isDeploying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card w-full max-w-2xl bg-zinc-900 border-zinc-800 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <TerminalIcon className="w-5 h-5 text-brand" />
                  Deployment Progress
                </h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                   <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Active</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Pull Layers */}
                <div className="space-y-3">
                  {Object.entries(pullProgress).map(([id, info]: [string, any]) => (
                    <div key={id} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">
                        <span>Layer {id}</span>
                        <span>{info.status}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${info.status.includes('Download') ? 'bg-brand' : 'bg-emerald-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: info.detail?.current ? `${(info.detail.current / info.detail.total) * 100}%` : '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logs */}
                <div className="pt-4 border-t border-zinc-800 space-y-1">
                  {deployLogs.map((log, i) => (
                    <div key={i} className="font-mono text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-zinc-950/50 flex justify-center border-t border-zinc-800">
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    Containo Deployment Engine v1.0
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
