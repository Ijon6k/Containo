'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SimpleForm } from '@/components/create/SimpleForm';
import { DeploymentLogs } from '@/components/create/DeploymentLogs';
import { useDeployment } from '@/hooks/useDeployment';
import { useNotify } from '@/components/providers/NotificationProvider';
import { parseDockerCommand } from '@/lib/services/cli-parser.service';

export default function ContainerDeployPage() {
  const router = useRouter();
  const { addToast } = useNotify();
  const [step, setStep] = useState<'form' | 'logs'>('form');
  const [deploymentMode, setDeploymentMode] = useState<'form' | 'cli'>('form');
  const [cliCommand, setCliCommand] = useState('docker run -d --name my-app -p 8080:80 nginx');

  const {
    isDeploying,
    deploymentLogs,
    deploymentComplete,
    pullProgress,
    handleDeploy,
    setDeploymentLogs,
  } = useDeployment(addToast);

  const startDeployment = (data?: any) => {
    setStep('logs');
    if (deploymentMode === 'cli') handleDeploy(parseDockerCommand(cliCommand));
    else handleDeploy(data);
  };

  const resetToForm = () => {
    setStep('form');
    setDeploymentLogs([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-hover rounded-sm transition-all text-text-secondary hover:text-text-primary"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            {step === 'form' ? 'Configure container' : 'Deployment progress'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {step === 'form'
              ? 'Deploy a single container using a guided form or docker run command.'
              : 'Monitoring deployment stream'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {step === 'form' ? (
          <SimpleForm
            onDeploy={startDeployment}
            isDeploying={isDeploying}
            cliCommand={cliCommand}
            setCliCommand={setCliCommand}
            deploymentMode={deploymentMode}
            setDeploymentMode={setDeploymentMode}
          />
        ) : (
          <DeploymentLogs
            logs={deploymentLogs}
            pullProgress={pullProgress}
            onClose={() => router.push('/dashboard')}
            isComplete={deploymentComplete}
          />
        )}
      </div>
    </div>
  );
}
