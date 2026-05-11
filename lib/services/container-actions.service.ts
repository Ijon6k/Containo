/**
 * Core Container Action Utilities
 * Pure API interactions for container lifecycle
 */

export const toggleContainerStatus = async (id: string, currentStatus: string) => {
  const action = currentStatus === 'running' ? 'stop' : 'start';
  const res = await fetch(`/api/containers/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error(`Failed to ${action} container`);
  const data = await res.json();
  return action === 'start' ? 'running' : 'exited';
};

export const restartContainerApi = async (id: string) => {
  const res = await fetch(`/api/containers/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action: 'restart' })
  });
  if (!res.ok) throw new Error('Failed to restart container');
  return true;
};

export const deleteContainerApi = async (id: string) => {
  const res = await fetch(`/api/containers/${id}/action`, { 
    method: 'POST',
    body: JSON.stringify({ action: 'delete' })
  });
  if (!res.ok) throw new Error('Failed to delete container');
  return true;
};
