'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Maintenance from '@/components/Maintenance';
import BackupRestore from '@/components/BackupRestore';
import SettingsView from '@/components/Settings';
import AuthFlow from '@/components/AuthFlow';
import CreateContainerFlow from '@/components/CreateContainerFlow';

// Modular UI Components
import { ToastContainer } from './ui/ToastContainer';
import { ConfirmModal } from './ui/ConfirmModal';

// Atomic Hooks
import { useAppState } from '@/hooks/useAppState';
import { useNotifications } from '@/hooks/useNotifications';

export default function ContainoApp() {
  const {
    isSetup, setIsSetup,
    isAuthenticated, setIsAuthenticated,
    theme, toggleTheme,
    currentView, setCurrentView,
    containers, setContainers,
    volumes, setVolumes,
    systemInfo,
    fetchContainers, fetchVolumes, fetchSystemInfo
  } = useAppState();

  const {
    toasts, addToast,
    confirmDialog, showConfirm, closeConfirm
  } = useNotifications();

  // If not setup, show onboarding
  if (!isSetup) {
    return <AuthFlow type="setup" onComplete={() => setIsSetup(true)} />;
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <AuthFlow type="login" onComplete={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            containers={containers} 
            setContainers={setContainers} 
            addToast={addToast} 
            showConfirm={showConfirm}
            systemInfo={systemInfo}
            onNavigateToDeploy={() => setCurrentView('deploy')}
          />
        );
      case 'deploy':
        return (
          <CreateContainerFlow 
            addToast={addToast} 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'maintenance':
        return (
          <Maintenance 
            containers={containers} 
            setContainers={setContainers}
            addToast={addToast}
            showConfirm={showConfirm}
            systemInfo={systemInfo}
            fetchSystemInfo={fetchSystemInfo}
          />
        );
      case 'backup':
        return (
          <BackupRestore 
            volumes={volumes}
            addToast={addToast} 
            showConfirm={showConfirm}
            fetchVolumes={fetchVolumes}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            theme={theme}
            toggleTheme={toggleTheme}
            addToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-ui-bg text-text-main transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={() => setIsAuthenticated(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-10 min-h-screen overflow-y-auto bg-background">
        <div className="max-w-[1400px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <div key={currentView}>
              {renderView()}
            </div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global UI Components */}
      <ToastContainer toasts={toasts} />
      <ConfirmModal dialog={confirmDialog} onClose={closeConfirm} />
    </div>
  );
}
