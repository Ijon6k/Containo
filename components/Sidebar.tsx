'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  ShieldCheck, 
  LogOut,
  Anchor,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { View } from '@/lib/types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  theme: 'light' | 'dark' | 'wholesome';
  toggleTheme: () => void;
}

export default function Sidebar({ currentView, setCurrentView, onLogout, theme, toggleTheme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Containers', icon: LayoutDashboard },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck },
    { id: 'backup', label: 'Backups', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-[#0c0c0e] border-r border-white/5 z-40 fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center">
          <Anchor className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-main">Containo</h1>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-brand text-white shadow-sm' 
                  : 'text-text-sub hover:bg-ui-accent hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-ui-border">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-sub hover:bg-ui-accent hover:text-text-main transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : theme === 'dark' ? <Sparkles className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? 'Dark Mode' : theme === 'dark' ? 'Wholesome Mode' : 'Light Mode'}
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
