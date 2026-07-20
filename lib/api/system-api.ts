import { apiClient } from './client';

export const pruneSystem = async (options?: string[]): Promise<any> => {
  const { data } = await apiClient.post('/system', {
    action: 'prune',
    options,
  });
  return data;
};
