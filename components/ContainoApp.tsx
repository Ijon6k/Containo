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



export default function ContainoApp() {
  // Auth State
  const [isSetup, setIsSetup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'wholesome'>('light');
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [containers, setContainers] = useState<Container[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, type });
  };

  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/containers');
      if (res.ok) setContainers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVolumes = async () => {
    try {
      const res = await fetch('/api/volumes');
      if (res.ok) setVolumes(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) setSystemInfo(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContainers();
      fetchVolumes();
      fetchSystemInfo();
      const interval = setInterval(() => {
        fetchContainers();
        fetchSystemInfo();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
  
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
                showConfirm={showConfirm}
                systemInfo={systemInfo}
              />
            )}
            {currentView === 'maintenance' && (
              <Maintenance 
                containers={containers}
                setContainers={setContainers}
                addToast={addToast} 
                showConfirm={showConfirm}
                systemInfo={systemInfo}
                fetchSystemInfo={fetchSystemInfo}
              />
            )}
            {currentView === 'backup' && (
              <BackupRestore 
                volumes={volumes}
                addToast={addToast} 
                showConfirm={showConfirm}
                fetchVolumes={fetchVolumes}
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

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card max-w-sm w-full p-6 shadow-2xl border-ui-border"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 ${
                  confirmDialog.type === 'danger' ? 'bg-rose-500/10 text-rose-500' :
                  confirmDialog.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-brand/10 text-brand'
                }`}>
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">{confirmDialog.title}</h3>
                <p className="text-sm text-text-sub mb-8 leading-relaxed">{confirmDialog.message}</p>
                
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 px-4 py-2 bg-ui-accent hover:bg-ui-border text-text-main rounded-md text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }}
                    className={`flex-1 px-4 py-2 text-white rounded-md text-xs font-bold transition-all ${
                      confirmDialog.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' :
                      confirmDialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                      'bg-brand hover:bg-brand/80'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast System */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
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
