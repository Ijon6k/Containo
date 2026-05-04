'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Trash2, 
  Terminal as TerminalIcon, 
  Activity, 
  Box, 
  Cpu,
  Plus,
  Search,
  ChevronRight,
  Info,
  Layers,
  HardDrive,
  RotateCcw
} from 'lucide-react';
import { Container } from '@/lib/types';
import CreateContainerFlow from './CreateContainerFlow';  

interface DashboardProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function Dashboard({ containers, setContainers, addToast }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [expandedStatsIds, setExpandedStatsIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const stats = [
    { label: 'Containers', value: containers.length, icon: Box, color: 'text-indigo-500' },
    { label: 'Running', value: containers.filter(c => c.status === 'running').length, icon: Play, color: 'text-emerald-500' },
    { label: 'CPU Usage', value: '12%', icon: Cpu, color: 'text-amber-500' },
    { label: 'Disk', value: '1.2 GB', icon: HardDrive, color: 'text-blue-500' },
  ];

  const toggleStatus = (id: string) => {
    setContainers(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'running' ? 'exited' : 'running';
        addToast(`${c.name} ${newStatus === 'running' ? 'started' : 'stopped'}`);
        return { ...c, status: newStatus as 'running' | 'exited' };
      }
      return c;
    }));
  };

  const deleteContainer = (id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
    addToast('Container removed');
  };

  const restartContainer = (id: string, name: string) => {
    addToast(`Restarting ${name}...`);
    setTimeout(() => addToast(`${name} restarted successfully`), 1000);
  };

  const filteredContainers = containers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.image.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Containers</h2>
          <p className="text-text-sub text-sm">Overview of your running services.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className={`p-2 rounded-md bg-ui-accent ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-sub uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-text-main">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Container List */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-ui-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-field py-1.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ui-accent/50 text-[11px] font-bold text-text-sub uppercase tracking-widest border-b border-ui-border">
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border">
              {filteredContainers.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="group hover:bg-ui-accent/20 transition-colors">
                    <td className="px-6 py-4">
                      <div 
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          c.status === 'running' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : 'bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${c.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                        {c.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-text-main">{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-sub">{c.image}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setExpandedStatsIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                          className={`p-1.5 rounded-md transition-colors ${
                            expandedStatsIds.includes(c.id)
                              ? 'bg-brand text-white dark:bg-brand/20 dark:text-brand'
                              : 'hover:bg-ui-accent text-text-sub hover:text-brand'
                          }`}
                          title="Monitoring Stats"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(c.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            c.status === 'running' 
                              ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-text-sub hover:text-amber-500' 
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-text-sub hover:text-emerald-500'
                          }`}
                          title={c.status === 'running' ? 'Stop' : 'Start'}
                        >
                          {c.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => restartContainer(c.id, c.name)}
                          className="p-1.5 rounded-md hover:bg-ui-accent text-text-sub hover:text-indigo-500 transition-colors"
                          title="Restart"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedContainer(c)}
                          className="p-1.5 rounded-md hover:bg-ui-accent text-text-sub hover:text-text-main transition-colors"
                          title="Logs"
                        >
                          <TerminalIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteContainer(c.id)}
                          className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 text-text-sub hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Accordion Stats */}
                  <AnimatePresence>
                    {expandedStatsIds.includes(c.id) && (
                      <tr className="bg-ui-accent/10 border-b border-ui-border">
                        <td colSpan={4} className="p-0">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* CPU Usage */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-text-sub flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Usage</span>
                                  <span className="font-bold text-amber-500">12.4%</span>
                                </div>
                                <div className="h-1.5 w-full bg-ui-border rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '12.4%' }} />
                                </div>
                              </div>
                              {/* Memory Usage */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-text-sub flex items-center gap-1"><Layers className="w-3 h-3" /> Memory</span>
                                  <span className="font-bold text-brand">245 MB / 1 GB</span>
                                </div>
                                <div className="h-1.5 w-full bg-ui-border rounded-full overflow-hidden">
                                  <div className="h-full bg-brand rounded-full" style={{ width: '24.5%' }} />
                                </div>
                              </div>
                              {/* Network I/O */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-text-sub flex items-center gap-1"><Activity className="w-3 h-3" /> Network I/O</span>
                                  <span className="font-bold text-emerald-500">1.2 MB / 450 KB</span>
                                </div>
                                <div className="h-1.5 w-full bg-ui-border rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                                </div>
                              </div>
                              {/* Block I/O */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-text-sub flex items-center gap-1"><HardDrive className="w-3 h-3" /> Block I/O</span>
                                  <span className="font-bold text-indigo-500">12 MB / 0 B</span>
                                </div>
                                <div className="h-1.5 w-full bg-ui-border rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '15%' }} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Modal */}
      <AnimatePresence>
        {selectedContainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="card w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-ui-border flex items-center justify-between bg-ui-bg">
                <div className="flex items-center gap-3">
                  <TerminalIcon className="w-4 h-4 text-brand" />
                  <span className="text-sm font-bold text-text-main">{selectedContainer.name}</span>
                </div>
                <button onClick={() => setSelectedContainer(null)} className="p-1 hover:bg-ui-accent rounded-md text-text-sub transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>
              <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto font-mono text-xs text-zinc-300 custom-scrollbar leading-relaxed">
                {selectedContainer.logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-zinc-600 mr-3">{i + 1}</span>
                    {log}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateContainerFlow 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        addToast={addToast} 
      />
    </div>
  );
}
