import { apiClient } from "./client";

export const importBackup = async (formData: FormData): Promise<any> => {
  const { data } = await apiClient.post("/volumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const backupIndividual = async (name: string): Promise<Blob> => {
  const { data } = await apiClient.post(
    `/volumes/${name}`,
    {},
    {
      responseType: "blob",
    },
  );
  return data;
};
