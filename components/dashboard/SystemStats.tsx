import React from 'react';
import { Package, Activity, Cpu, HardDrive } from 'lucide-react';
import { Container } from '@/lib/types';

interface SystemStatsProps {
  containers: Container[];
  systemInfo: any;
}

export const SystemStats = ({ containers, systemInfo }: SystemStatsProps) => {
  const stats = [
    {
      label: 'Containers',
      value: containers.length,
      icon: Package,
      color: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      label: 'Running',
      value: containers.filter(c => c.status === 'running').length,
      icon: Activity,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: 'CPU Usage',
      value: `${systemInfo?.cpuUsage || 12}%`,
      icon: Cpu,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      label: 'Disk',
      value: `${systemInfo?.diskUsage || '1.2 GB'}`,
      icon: HardDrive,
      color: 'bg-blue-500/10 text-blue-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="card p-6 flex items-center gap-4 border-white/5 bg-[#121214]">
          <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-text-main">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
