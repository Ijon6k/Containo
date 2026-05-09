'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { ServiceData } from '@/lib/types';
import { ModeSelection } from './create/ModeSelection';
import { SimpleForm } from './create/SimpleForm';
import { ComposeBuilder } from './create/ComposeBuilder';
import { DeploymentLogs } from './create/DeploymentLogs';
import { useDeployment } from '@/hooks/useDeployment';
import { parseDockerCommand } from '@/lib/cli-parser';

interface CreateContainerFlowProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
  onBack: () => void;
}

export default function CreateContainerFlow({ addToast, onBack }: CreateContainerFlowProps) {
  const [step, setStep] = useState<'mode' | 'form' | 'logs'>('mode');
  const [mode, setMode] = useState<'simple' | 'compose' | 'cli'>('simple');
  const [deploymentMode, setDeploymentMode] = useState<'form' | 'cli'>('form');
  
  const [simpleData, setSimpleData] = useState<ServiceData>({
    id: '',
    name: '',
    image: '',
    ports: '',
    env: '',
    volumes: '',
    restartPolicy: 'no'
  });
  const [cliCommand, setCliCommand] = useState('docker run -d --name my-app -p 8080:80 nginx');

  const {
    isDeploying,
    deploymentLogs,
    deploymentComplete,
    pullProgress,
    handleDeploy,
    setDeploymentLogs
  } = useDeployment(addToast);

  const resetAndBack = () => {
    setStep('mode');
    setDeploymentLogs([]);
    onBack();
  };

  const onModeSelect = (selectedMode: 'simple' | 'compose' | 'cli') => {
    setMode(selectedMode);
    if (selectedMode === 'cli') {
      setDeploymentMode('cli');
    } else {
      setDeploymentMode('form');
    }
    setStep('form');
  };

  const startDeployment = (data?: any) => {
    setStep('logs');
    if (mode === 'compose') {
      handleDeploy(data);
    } else if (deploymentMode === 'cli') {
      const parsedData = parseDockerCommand(cliCommand);
      handleDeploy(parsedData);
    } else {
      handleDeploy(simpleData);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={step === 'mode' ? onBack : () => setStep('mode')} 
            className="p-2 hover:bg-white/5 rounded-md transition-all text-text-sub hover:text-text-main"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
             <h1 className="text-xl font-semibold text-text-main">
                {step === 'mode' ? 'New Deployment' : step === 'form' ? `Configure ${mode === 'compose' ? 'Stack' : 'Container'}` : 'Deployment Progress'}
             </h1>
             <p className="text-sm text-text-sub mt-1">
                {step === 'mode' ? 'Select your preferred deployment method' : step === 'form' ? 'Provide container specifications' : 'Monitoring deployment stream'}
             </p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text-main transition-all"
        >
          Cancel
        </button>
      </div>

      {/* Main Page Content */}
      <div className="flex-1 bg-ui-bg border border-ui-border rounded-md shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <AnimatePresence mode="wait">
            {step === 'mode' && (
              <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <ModeSelection onSelect={onModeSelect} />
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                {(mode === 'simple' || mode === 'cli') && (
                  <SimpleForm 
                    data={simpleData} 
                    onChange={setSimpleData} 
                    onDeploy={() => startDeployment()} 
                    isDeploying={isDeploying}
                    cliCommand={cliCommand}
                    setCliCommand={setCliCommand}
                    deploymentMode={deploymentMode}
                    setDeploymentMode={setDeploymentMode}
                  />
                )}
                {mode === 'compose' && (
                  <ComposeBuilder 
                    onDeploy={startDeployment}
                    isDeploying={isDeploying}
                  />
                )}
              </motion.div>
            )}

            {step === 'logs' && (
              <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <DeploymentLogs 
                  logs={deploymentLogs} 
                  isComplete={deploymentComplete} 
                  pullProgress={pullProgress}
                  onClose={resetAndBack} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Simplified Footer */}
      <div className="mt-6 flex justify-end">
         <span className="text-xs text-text-sub opacity-30 font-medium">Containo v2.4</span>
      </div>
    </div>
  );
}
