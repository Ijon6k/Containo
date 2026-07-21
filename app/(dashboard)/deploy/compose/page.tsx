'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ComposeBuilder } from '@/components/create/ComposeBuilder';
import { DeploymentLogs } from '@/components/create/DeploymentLogs';
import { useNotify } from '@/components/providers/NotificationProvider';
import { buildComposeYaml } from '@/lib/services/compose-yaml.service';

export default function ComposeDeployPage() {
  const router = useRouter();
  const { addToast } = useNotify();
  const [step, setStep] = useState<'form' | 'logs'>('form');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const streamComposeDeploy = async (body: Record<string, string>) => {
    setStep('logs');
    setDeploymentLogs([]);
    setDeploymentComplete(false);
    setIsDeploying(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const decoder = new TextDecoder();

    try {
      const res = await fetch('/api/compose/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const p = JSON.parse(line);
            if (p.type === 'log' || p.type === 'create')
              setDeploymentLogs((prev) => [...prev, p.message]);
            else if (p.type === 'success') {
              setDeploymentLogs((prev) => [...prev, `[SUCCESS] ${p.message}`]);
              setDeploymentComplete(true);
            } else if (p.type === 'error') {
              setDeploymentLogs((prev) => [...prev, `[ERROR] ${p.message}`]);
              setDeploymentComplete(true);
              addToast(p.message, 'error');
            }
          } catch {
            setDeploymentLogs((prev) => [...prev, line]);
          }
        }
      }
      if (buffer.trim()) {
        try {
          const p = JSON.parse(buffer);
          if (p.type === 'success') {
            setDeploymentLogs((prev) => [...prev, `[SUCCESS] ${p.message}`]);
            setDeploymentComplete(true);
          }
        } catch {
          setDeploymentLogs((prev) => [...prev, buffer.trim()]);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setDeploymentLogs((prev) => [...prev, '[STOPPED] Deployment cancelled']);
        setDeploymentComplete(true);
        addToast('Deployment stopped', 'error');
      } else {
        setDeploymentLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
        setDeploymentComplete(true);
        addToast(err.message, 'error');
      }
    } finally {
      setIsDeploying(false);
      abortRef.current = null;
    }
  };

  const handleDeploy = (services: any, stackName: string, targetDir: string) => {
    const yaml = buildComposeYaml(services);
    const clean = targetDir.endsWith('/') ? targetDir.slice(0, -1) : targetDir;
    // ponytail: sanitize stackName — only allow safe path characters
    const safeName = stackName.replace(/[^a-zA-Z0-9_\-.]/g, '-').slice(0, 64);
    streamComposeDeploy({ targetPath: `${clean}/${safeName}`, yamlContent: yaml });
  };

  const handleDeployExisting = (path: string, composeFile?: string) => {
    streamComposeDeploy({ targetPath: path, ...(composeFile ? { composeFile } : {}) });
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
            {step === 'form' ? 'Configure stack' : 'Deployment progress'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {step === 'form'
              ? 'Build a multi-service Docker Compose stack with visual preview.'
              : 'Monitoring deployment stream'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {step === 'form' ? (
          <ComposeBuilder
            onDeploy={handleDeploy}
            onDeployExisting={handleDeployExisting}
            isDeploying={isDeploying}
          />
        ) : (
          <DeploymentLogs
            logs={deploymentLogs}
            pullProgress={{}}
            onClose={() => router.push('/dashboard')}
            isComplete={deploymentComplete}
            onStop={isDeploying ? () => abortRef.current?.abort() : undefined}
          />
        )}
      </div>
    </div>
  );
}
