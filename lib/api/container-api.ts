import axios from 'axios';
import { z } from 'zod';
import { Container } from '../types/index';

export const ContainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  status: z.union([z.literal('running'), z.literal('exited')]),
  ports: z.string(),
  logs: z.array(z.string()).optional(),
});

const api = axios.create({
  baseURL: '/api',
});

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
