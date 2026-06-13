'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  LogOut,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onLogout, 
  theme, 
  toggleTheme 
}: SidebarProps) {
  const pathname = usePathname();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Containers', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'backup', label: 'Backups', icon: Database, href: '/backups' },
  ];

  return (
    <aside 
      className={`h-screen flex flex-col bg-ui-bg border-r border-ui-border z-40 fixed left-0 top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      {isCollapsed ? (
        <div 
          className="p-4 flex justify-center items-center border-b border-ui-border/20 h-[73px]"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <button
            onClick={onToggleCollapse}
            className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-ui-accent transition-all text-brand relative"
            title="Expand Sidebar"
          >
            {isLogoHovered ? (
              <PanelLeft className="w-5 h-5 text-brand" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo/containologo.webp" 
                  alt="Containo Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </button>
        </div>
      ) : (
        <div className="p-6 flex items-center justify-between border-b border-ui-border/20 h-[73px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/logo/containologo.webp" 
                alt="Containo Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-main truncate">Containo</span>
          </div>
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-ui-accent text-text-sub hover:text-text-main transition-colors shrink-0"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 mt-6 space-y-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center rounded-md transition-all text-sm font-medium ${
                isCollapsed 
                  ? 'justify-center w-12 h-12 mx-auto' 
                  : 'w-full gap-3 px-3 py-2'
              } ${
                isActive 
                  ? 'bg-brand text-white shadow-sm' 
                  : 'text-text-sub hover:bg-ui-accent hover:text-text-main'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
              {!isCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Settings & Logout */}
      <div className={`p-4 border-t border-ui-border/20 ${isCollapsed ? 'space-y-3' : 'space-y-2'}`}>
        <button 
          onClick={toggleTheme}
          className={`flex items-center rounded-md text-sm font-medium text-text-sub hover:bg-ui-accent hover:text-text-main transition-all ${
            isCollapsed 
              ? 'justify-center w-12 h-12 mx-auto' 
              : 'w-full gap-3 px-3 py-2'
          }`}
          title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
        >
          {theme === 'light' ? (
            <Moon className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
          ) : (
            <Sun className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
          {!isCollapsed && (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
        </button>
        <button 
          onClick={onLogout}
          className={`flex items-center rounded-md text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all ${
            isCollapsed 
              ? 'justify-center w-12 h-12 mx-auto' 
              : 'w-full gap-3 px-3 py-2'
          }`}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <LogOut className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} />
          {!isCollapsed && 'Log Out'}
        </button>
      </div>
    </aside>
  );
}
