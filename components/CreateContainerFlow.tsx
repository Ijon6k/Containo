'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { ServiceData } from '@/lib/types';
import { ModeSelection } from './create/ModeSelection';
import { SimpleForm } from './create/SimpleForm';
import { CliEditor } from './create/CliEditor';
import { DeploymentLogs } from './create/DeploymentLogs';
import { useDeployment } from '@/hooks/useDeployment';

interface CreateContainerFlowProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function CreateContainerFlow({ isOpen, onClose, addToast }: CreateContainerFlowProps) {
  const [step, setStep] = useState<'mode' | 'form' | 'logs'>('mode');
  const [mode, setMode] = useState<'simple' | 'compose' | 'cli'>('simple');
  
  // Form States
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

  const resetAndClose = () => {
    setStep('mode');
    setDeploymentLogs([]);
    onClose();
  };

  const onModeSelect = (selectedMode: 'simple' | 'compose' | 'cli') => {
    setMode(selectedMode);
    setStep('form');
  };

  const startDeployment = () => {
    const data = mode === 'simple' ? simpleData : { ...simpleData, image: cliCommand }; // Simple proxy for CLI
    setStep('logs');
    handleDeploy(mode === 'simple' ? simpleData : { ...simpleData, id: 'cli-deploy', name: 'CLI Deployment', image: 'cli', env: cliCommand }); // Adjusted for actual logic
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 md:p-6 bg-zinc-950/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-ui-border flex justify-between items-center bg-ui-accent/5">
          <div className="flex items-center gap-4">
            {step === 'form' && (
              <button onClick={() => setStep('mode')} className="p-2 hover:bg-ui-accent rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-text-sub" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-text-main">
                {step === 'mode' ? 'Deploy New Service' : step === 'form' ? `Configuring ${mode === 'cli' ? 'CLI' : 'Container'}` : 'Deployment Progress'}
              </h2>
              <p className="text-xs text-text-sub mt-0.5">Step {step === 'mode' ? '1' : step === 'form' ? '2' : '3'} of 3</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-ui-bg/50">
          <AnimatePresence mode="wait">
            {step === 'mode' && (
              <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ModeSelection onSelect={onModeSelect} />
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {mode === 'simple' && (
                  <SimpleForm 
                    data={simpleData} 
                    onChange={setSimpleData} 
                    onDeploy={startDeployment} 
                    isDeploying={isDeploying} 
                  />
                )}
                {mode === 'cli' && (
                  <CliEditor 
                    value={cliCommand} 
                    onChange={setCliCommand} 
                    onDeploy={startDeployment} 
                    isDeploying={isDeploying} 
                    addToast={addToast}
                  />
                )}
                {mode === 'compose' && <div className="p-12 text-center text-text-sub italic">Docker Compose mode coming soon.</div>}
              </motion.div>
            )}

            {step === 'logs' && (
              <motion.div key="logs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <DeploymentLogs 
                  logs={deploymentLogs} 
                  isComplete={deploymentComplete} 
                  pullProgress={pullProgress}
                  onClose={resetAndClose} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
