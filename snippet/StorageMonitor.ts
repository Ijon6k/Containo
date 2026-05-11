/**
 * MODULE: Storage Analysis Engine
 * FUNCTION: Menganalisis utilisasi disk host dan sistem Docker
 */

import { execSync } from 'child_process';
import { docker } from '@/lib/core/docker';

export async function getStorageStats() {
  // 1. Mendapatkan data kapasitas host via perintah shell (df)
  const dfOutput = execSync('df -B1 / --output=size,used,avail').toString();
  const [_, total, used, avail] = dfOutput.split('\n')[1].trim().split(/\s+/);

  // 2. Mendapatkan data penggunaan Docker Engine
  const info = await docker.df();
  
  // Menghitung total penggunaan storage oleh Image
  const imagesSize = info.Images.reduce((sum: number, img: any) => sum + img.Size, 0);
  
  // Menghitung total penggunaan storage oleh Container
  const containersSize = info.Containers.reduce((sum: number, cont: any) => sum + (cont.SizeRw || 0), 0);

  return {
    host: {
      total: parseInt(total),
      available: parseInt(avail),
      systemUsed: parseInt(used) - imagesSize - containersSize
    },
    docker: {
      images: imagesSize,
      containers: containersSize
    }
  };
}
