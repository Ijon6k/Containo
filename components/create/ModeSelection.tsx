import React from 'react';
import { motion } from 'framer-motion';
import { Box, Layers, Terminal, ChevronRight } from 'lucide-react';

interface ModeSelectionProps {
  onSelect: (mode: 'simple' | 'compose' | 'cli') => void;
}

export const ModeSelection = ({ onSelect }: ModeSelectionProps) => {
  const modes = [
    {
      id: 'simple',
      title: 'Container',
      desc: 'Deploy a single container using a guided configuration form.',
      icon: Box,
      color: 'text-brand'
    },
    {
      id: 'compose',
      title: 'Docker Compose',
      desc: 'Orchestrate multiple services using a stack visualizer and YAML.',
      icon: Layers,
      color: 'text-brand'
    },
    {
      id: 'cli',
      title: 'Command Line',
      desc: 'Directly execute raw docker run commands with automatic parsing.',
      icon: Terminal,
      color: 'text-success'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {modes.map((mode, i) => (
        <motion.button
          key={mode.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(mode.id as any)}
          className="group relative bg-surface border border-border rounded-md p-8 text-left hover:bg-hover hover:border-brand/30 transition-all flex flex-col h-full shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 bg-surface2 rounded-sm flex items-center justify-center mb-6">
            <mode.icon className={`w-6 h-6 ${mode.color}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            {mode.title}
          </h3>
          <p className="text-base text-text-secondary leading-relaxed mb-10 flex-grow">
            {mode.desc}
          </p>
          
          <div className="flex items-center gap-2 text-base font-semibold text-brand opacity-0 group-hover:opacity-100 transition-all">
             Continue
             <ChevronRight className="w-4 h-4" />
          </div>
        </motion.button>
      ))}
    </div>
  );
};
