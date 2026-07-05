import { apiClient } from './client';

export const authenticate = async (endpoint: string, username: string, password: string): Promise<any> => {
  const { data } = await apiClient.post(endpoint.replace('/api', ''), { username, password });
  return data;
};
