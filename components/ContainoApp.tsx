'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Container, Volume, View } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Maintenance from '@/components/Maintenance';
import BackupRestore from '@/components/BackupRestore';
import SettingsView from '@/components/Settings';
import AuthFlow from '@/components/AuthFlow';

// Initial Mock Data
const INITIAL_CONTAINERS: Container[] = [
  { id: '1', name: 'containo-api', image: 'containo/backend:latest', status: 'running', ports: '8080:8080', logs: ['[INFO] Server started on port 8080', '[INFO] Connected to Database', '[DEBUG] Heartbeat sent'] },
  { id: '2', name: 'containo-db', image: 'postgres:15-alpine', status: 'running', ports: '5432:5432', logs: ['[INFO] Database ready to accept connections', '[INFO] System started'] },
  { id: '3', name: 'redis-cache', image: 'redis:latest', status: 'exited', ports: '6379:6379', logs: ['[INFO] Redis server v7.2.0', '[WARN] Connection closed'] },
  { id: '4', name: 'nginx-proxy', image: 'nginx:stable', status: 'running', ports: '80:80, 443:443', logs: ['[INFO] Configuration reloaded', '[INFO] Worker processes started'] },
];

const INITIAL_VOLUMES: Volume[] = [
  { id: 'v1', name: 'containo-db-data', size: '2.4 GB', lastBackup: '2024-05-01 12:00' },
  { id: 'v2', name: 'redis-data', size: '150 MB', lastBackup: '2024-04-30 15:30' },
];

export default function ContainoApp() {
  // Auth State
  const [isSetup, setIsSetup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'wholesome'>('light');
  
  // App State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [containers, setContainers] = useState<Container[]>(INITIAL_CONTAINERS);
  const [volumes] = useState<Volume[]>(INITIAL_VOLUMES);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  
  // Persistence and Theme apply
  useEffect(() => {
    const setup = localStorage.getItem('containo_setup');
    if (setup) setTimeout(() => setIsSetup(true), 0);
    
    const savedTheme = localStorage.getItem('containo_theme') as 'light' | 'dark' | 'wholesome';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('containo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'wholesome';
      return 'light';
    });
  };

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  if (!isAuthenticated) {
    return (
      <AuthFlow 
        isSetup={isSetup} 
        onSetupComplete={() => {
          setIsSetup(true);
          localStorage.setItem('containo_setup', 'true');
          addToast('Setup complete! Welcome.');
        }}
        onLogin={(pass) => {
          if (pass === 'admin') {
            setIsAuthenticated(true);
            addToast('Logged in successfully');
          } else {
            addToast('Incorrect password', 'error');
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={() => setIsAuthenticated(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 relative overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                containers={containers} 
                setContainers={setContainers} 
                addToast={addToast} 
              />
            )}
            {currentView === 'maintenance' && (
              <Maintenance 
                containers={containers}
                setContainers={setContainers}
                addToast={addToast} 
              />
            )}
            {currentView === 'backup' && (
              <BackupRestore 
                volumes={volumes}
                addToast={addToast} 
              />
            )}
            {currentView === 'settings' && (
              <SettingsView 
                addToast={addToast} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center gap-3 px-4 py-3 rounded-md shadow-lg bg-ui-bg border border-ui-border min-w-[200px]"
            >
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
