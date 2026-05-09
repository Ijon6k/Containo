import { useState, useCallback } from 'react';
import { ServiceData } from '@/lib/types';

export const useDeployment = (addToast: (msg: string, type?: 'success' | 'error') => void) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [pullProgress, setPullProgress] = useState<Record<string, any>>({});

  const handleDeploy = useCallback(async (data: ServiceData) => {
    setIsDeploying(true);
    setDeploymentLogs(['Initializing deployment...']);
    setDeploymentComplete(false);
    setPullProgress({});

    try {
      const response = await fetch('/api/containers/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Deployment failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read response stream');

      const decoder = new TextEncoder().encode('').constructor === Uint8Array
        ? new TextDecoder()
        : { decode: (u: any) => String.fromCharCode.apply(null, u as any) };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = (decoder as TextDecoder).decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        lines.forEach(line => {
          try {
            const parsed = JSON.parse(line);
            let message = '';

            if (parsed.type === 'pull') {
              message = `[PULL] ${parsed.status} ${parsed.progress || ''}`;
              if (parsed.id) {
                setPullProgress(prev => ({
                  ...prev,
                  [parsed.id]: {
                    status: parsed.status,
                    progressDetail: parsed.progressDetail
                  }
                }));
              }
            } else if (parsed.type === 'create') {
              message = `[CREATE] ${parsed.message}`;
            } else if (parsed.type === 'success') {
              message = `[SUCCESS] ${parsed.message}`;
              setDeploymentComplete(true);
            } else if (parsed.type === 'error') {
              message = `[ERROR] ${parsed.message}`;
              addToast(parsed.message, 'error');
            }

            if (message) setDeploymentLogs(prev => [...prev, message]);
          } catch (e) {
            setDeploymentLogs(prev => [...prev, line]);
          }
        });
      }
    } catch (error: any) {
      setDeploymentLogs(prev => [...prev, `[FATAL] ${error.message}`]);
      addToast(error.message, 'error');
    } finally {
      setIsDeploying(false);
    }
  }, [addToast]);

  return {
    isDeploying,
    deploymentLogs,
    deploymentComplete,
    pullProgress,
    handleDeploy,
    setDeploymentLogs,
    setDeploymentComplete,
    setPullProgress
  };
};
