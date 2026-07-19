import { Container, ServiceData } from '../types/index';
import { apiClient as api } from './client';

export const deployContainerStream = async (data: ServiceData) => {
  const response = await fetch('/api/containers/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Deployment failed');
  return response;
};

export const fetchContainers = async (): Promise<Container[]> => {
  const { data } = await api.get('/containers');
  return data as Container[];
};

export const startContainer = async (id: string) => {
  const { data } = await api.post(`/containers/${id}/action`, { action: 'start' });
  return data;
};

export const stopContainer = async (id: string) => {
  const { data } = await api.post(`/containers/${id}/action`, { action: 'stop' });
  return data;
};

export const restartContainer = async (id: string) => {
  const { data } = await api.post(`/containers/${id}/action`, { action: 'restart' });
  return data;
};

export const deleteContainer = async (id: string) => {
  const { data } = await api.post(`/containers/${id}/action`, { action: 'delete' });
  return data;
};
