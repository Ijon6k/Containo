import { Container } from '@/lib/types';
import { resolveContainerWebUrl } from '@/lib/utils/network';

interface UseContainerActionsProps {
  containers: Container[];
  startContainer: (id: string) => Promise<unknown>;
  stopContainer: (id: string) => Promise<unknown>;
  restartMutation: (id: string) => Promise<unknown>;
  deleteMutation: (id: string) => Promise<unknown>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
}

export function useContainerActions({
  containers,
  startContainer,
  stopContainer,
  restartMutation,
  deleteMutation,
  addToast,
  showConfirm,
}: UseContainerActionsProps) {
  const toggleStatus = async (id: string) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;

    try {
      if (container.status === 'running') {
        await stopContainer(id);
        addToast('Container stopped successfully');
      } else {
        await startContainer(id);
        addToast('Container started successfully');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Action failed';
      addToast(msg, 'error');
    }
  };

  const restartContainer = async (id: string, name: string) => {
    showConfirm('Restart Container', `Are you sure you want to restart ${name}?`, async () => {
      try {
        await restartMutation(id);
        addToast('Container restarted successfully');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Action failed';
        addToast(msg, 'error');
      }
    });
  };

  const deleteContainer = async (container: Container) => {
    showConfirm(
      'Delete Container',
      `Are you sure you want to delete ${container.name}?`,
      async () => {
        try {
          await deleteMutation(container.id);
          addToast('Container deleted');
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Action failed';
          addToast(msg, 'error');
        }
      },
      'danger',
    );
  };

  const openWebUI = (c: Container) => {
    const url = resolveContainerWebUrl(c);
    if (url) {
      window.open(url, '_blank');
    } else {
      addToast(`Could not auto-detect web port for ${c.name}. Please check container logs.`, 'error');
    }
  };

  return { toggleStatus, restartContainer, deleteContainer, openWebUI };
}
