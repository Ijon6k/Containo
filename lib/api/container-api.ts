import { z } from 'zod';
import { Container, ServiceData } from '../types/index';
import { apiClient as api } from './client';

export const ContainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  status: z.union([z.literal('running'), z.literal('exited')]),
  ports: z.string(),
  logs: z.array(z.string()).optional(),
  composeProject: z.string().optional(),
  composeService: z.string().optional(),
  composeConfig: z.string().optional(),
  composeWorkingDir: z.string().optional(),
});

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
  return z.array(ContainerSchema).parse(data);
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
