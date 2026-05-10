'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  ShieldCheck, 
  LogOut,
  Anchor,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Sidebar({ onLogout, theme, toggleTheme }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Containers', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck, href: '/maintenance' },
    { id: 'backup', label: 'Backups', icon: Database, href: '/backups' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-ui-bg border-r border-ui-border z-40 fixed left-0 top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
          <img 
            src="/logo/containologo.webp" 
            alt="Containo Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-main">Containo</h1>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                isActive 
                  ? 'bg-brand text-white shadow-sm' 
                  : 'text-text-sub hover:bg-ui-accent hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-ui-border">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-sub hover:bg-ui-accent hover:text-text-main transition-all"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
