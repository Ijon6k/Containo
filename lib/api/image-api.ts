import { apiClient } from './client';

export const fetchImages = async (): Promise<any[]> => {
  const { data } = await apiClient.get('/images');
  return data;
};

export const deleteImage = async (id: string, force: boolean = false): Promise<any> => {
  const { data } = await apiClient.delete(`/images?id=${id}${force ? '&force=true' : ''}`);
  return data;
};
