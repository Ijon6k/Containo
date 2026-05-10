import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Package, HardDrive, Activity, Cpu, BarChart3, AlignLeft, Layers, Zap } from 'lucide-react';
import { Container } from '@/lib/types';
import { useMetricHistory } from '@/hooks/useMetricHistory';

interface SystemStatsProps {
  containers: Container[];
  systemInfo: any;
}

type ViewMode = 'bar' | 'braille';

const BtopChart = ({ value, color, trigger }: { value: number; color: string; trigger?: any }) => {
  const history = useMetricHistory(value, 60, trigger);
  return (
    <div className="h-20 flex items-end gap-[1px] overflow-hidden mt-2 bg-ui-accent rounded-md p-1.5 border border-ui-border relative">
      <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none p-1.5">
        <div className="w-full h-[1px] bg-text-main" />
        <div className="w-full h-[1px] bg-text-main" />
        <div className="w-full h-[1px] bg-text-main" />
      </div>
      
      {history.map((val, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ height: `${Math.max(2, val)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`flex-1 min-w-[2px] ${color} opacity-60`}
        />
      ))}
    </div>
  );
};

const LinearBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-1.5 bg-ui-accent rounded-full mt-3 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      className={`h-full ${color}`}
    />
  </div>
);

export const SystemStats = ({ containers, systemInfo }: SystemStatsProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('braille');

  const sysCpu = systemInfo?.cpuUsage || 0;
  const sysMem = systemInfo?.memUsage || 0;
  const dockerCpu = systemInfo?.dockerCpu || 0;
  const dockerMem = systemInfo?.dockerMem || 0;
  const timestamp = systemInfo?.timestamp;
  
  const storage = systemInfo?.storage || { hostTotal: 1, hostFree: 0, hostUsed: 0, systemBytes: 0, dockerBytes: 0 };
  const systemGB = (storage.systemBytes / (1024 ** 3)) || 0;
  const dockerGB = (storage.dockerBytes / (1024 ** 3)) || 0;
  const freeGB = (storage.hostFree / (1024 ** 3)) || 0;

  const systemPercent = (storage.systemBytes / storage.hostTotal) * 100;
  const dockerPercent = (storage.dockerBytes / storage.hostTotal) * 100;

  return (
    <div className="space-y-4 mb-10">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
           <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest">Real-time Metrics</span>
        </div>
        <div className="flex bg-ui-accent/50 rounded-lg p-1 border border-ui-border shadow-inner">
          <button 
            onClick={() => setViewMode('bar')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'bar' ? 'bg-brand text-white shadow-md' : 'text-text-sub hover:text-text-main'}`}
            title="Horizontal Progress"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewMode('braille')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'braille' ? 'bg-brand text-white shadow-md' : 'text-text-sub hover:text-text-main'}`}
            title="Vertical Bars"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: System Resources */}
        <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-brand transition-all duration-500 scale-110">
            <Cpu className="w-28 h-28" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <Server className="w-5 h-5 text-brand" />
            <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">Host Resources</span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                <span>CPU Load</span>
                <span className="text-text-main font-bold">{sysCpu}%</span>
              </div>
              {viewMode === 'braille' ? <BtopChart value={sysCpu} color="bg-brand" trigger={timestamp} /> : <LinearBar value={sysCpu} color="bg-brand" />}
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                <span>Memory Use</span>
                <span className="text-text-main font-bold">{sysMem}%</span>
              </div>
              {viewMode === 'braille' ? <BtopChart value={sysMem} color="bg-indigo-500" trigger={timestamp} /> : <LinearBar value={sysMem} color="bg-indigo-500" />}
            </div>
          </div>
        </div>

        {/* Card 2: Container Engine */}
        <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
          <div className="absolute -right-2 -top-2 opacity-[0.02] group-hover:opacity-10 group-hover:text-emerald-500 transition-all duration-700 scale-125 rotate-12">
            <Package className="w-36 h-36" />
          </div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">Engine Status</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold text-emerald-500 uppercase tracking-tight">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 relative z-10">
            <div className="flex justify-between items-center p-4 rounded-md bg-ui-accent border border-ui-border">
              <span className="text-sm text-text-sub font-medium">Deployed Units</span>
              <span className="text-2xl font-bold text-text-main font-mono">{containers.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-md bg-ui-accent border border-ui-border">
              <span className="text-sm text-text-sub font-medium">Running Now</span>
              <span className="text-2xl font-bold text-emerald-500 font-mono">{containers.filter(c => c.status === 'running').length}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs font-semibold text-text-sub uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
             <span className="font-mono">BUILD_24.0.7</span>
             <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Docker Impact */}
        <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-amber-500 transition-all duration-500 scale-110">
            <Zap className="w-28 h-28" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">Load Impact</span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                <span>Docker CPU</span>
                <span className="text-amber-500 font-bold">{dockerCpu}%</span>
              </div>
              {viewMode === 'braille' ? <BtopChart value={dockerCpu} color="bg-amber-500" trigger={timestamp} /> : <LinearBar value={dockerCpu} color="bg-amber-500" />}
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                <span>Docker RAM</span>
                <span className="text-amber-500 font-bold">{dockerMem}%</span>
              </div>
              {viewMode === 'braille' ? <BtopChart value={dockerMem} color="bg-amber-600" trigger={timestamp} /> : <LinearBar value={dockerMem} color="bg-amber-600" />}
            </div>
          </div>
        </div>

        {/* Card 4: Storage Status */}
        <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-indigo-500 transition-all duration-500 scale-110">
            <HardDrive className="w-28 h-28" />
          </div>
          <div className="flex items-center gap-2 mb-8">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">Storage Health</span>
          </div>
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <p className="text-xs text-text-sub uppercase font-bold tracking-widest opacity-60">Free Capacity</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-text-main font-mono leading-none">{freeGB.toFixed(1)}</span>
                   <span className="text-sm text-text-sub font-bold uppercase font-mono">GB</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-500 font-mono leading-none">{((storage.hostUsed / storage.hostTotal) * 100).toFixed(0)}%</p>
                <p className="text-xs text-text-sub uppercase font-bold mt-2">Used</p>
              </div>
            </div>
            
            <div className="w-full h-4 bg-ui-accent rounded-md overflow-hidden flex border border-ui-border p-0.5">
              <motion.div 
                title="System / OS"
                initial={{ width: 0 }} 
                animate={{ width: `${systemPercent}%` }} 
                className="h-full bg-slate-400 rounded-l-sm" 
              />
              <motion.div 
                title="Docker Data"
                initial={{ width: 0 }} 
                animate={{ width: `${dockerPercent}%` }} 
                className="h-full bg-brand" 
              />
              <div className="flex-1 h-full bg-transparent" title="Free Space" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-sub uppercase font-bold leading-none">System</span>
                    <span className="text-sm font-bold text-text-main font-mono leading-none mt-1.5">{systemGB.toFixed(1)} GB</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-sub uppercase font-bold leading-none">Docker</span>
                    <span className="text-sm font-bold text-text-main font-mono leading-none mt-1.5">{dockerGB.toFixed(1)} GB</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
