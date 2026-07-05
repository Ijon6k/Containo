import { apiClient } from './client';

export const pruneSystem = async (): Promise<any> => {
  const { data } = await apiClient.post('/system', { action: 'prune' });
  return data;
};
