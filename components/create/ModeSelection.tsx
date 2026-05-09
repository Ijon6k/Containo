import React from 'react';
import { Layout, Terminal as TerminalIcon, FileText } from 'lucide-react';

interface ModeSelectionProps {
  onSelect: (mode: 'simple' | 'compose' | 'cli') => void;
}

export const ModeSelection = ({ onSelect }: ModeSelectionProps) => {
  const modes = [
    {
      id: 'simple',
      title: 'Simple Deployment',
      description: 'Create a single container with a guided form. Best for quick apps.',
      icon: Layout,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'compose',
      title: 'Docker Compose',
      description: 'Deploy multi-container stacks using YAML configuration.',
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'cli',
      title: 'CLI Mode',
      description: 'Paste your "docker run" command directly. Advanced power users.',
      icon: TerminalIcon,
      color: 'text-brand',
      bg: 'bg-brand/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
      {modes.map((mode) => (
        <div 
          key={mode.id} 
          onClick={() => onSelect(mode.id as any)}
          className="card p-8 flex flex-col items-center text-center cursor-pointer hover:border-brand/50 transition-all group"
        >
          <div className={`w-16 h-16 rounded-2xl ${mode.bg} flex items-center justify-center ${mode.color} mb-6 transition-transform group-hover:scale-110`}>
            <mode.icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">
            {mode.id === 'simple' ? 'Simple Setup' : mode.id === 'compose' ? 'Docker Compose' : 'CLI Mode'}
          </h3>
          <p className="text-sm text-text-sub leading-relaxed">{mode.description}</p>
        </div>
      ))}
    </div>
  );
};
