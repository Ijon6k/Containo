/**
 * MODULE: Container Lifecycle Manager
 * FUNCTION: Mengelola status operasional kontainer
 */

import { docker } from '@/lib/docker';

export const manageContainer = async (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
  const container = docker.getContainer(id);

  switch (action) {
    case 'start':
      return await container.start();
    case 'stop':
      // Menghentikan kontainer dengan grace period
      return await container.stop();
    case 'restart':
      return await container.restart();
    case 'remove':
      // Menghapus kontainer beserta volumenya jika perlu
      return await container.remove({ force: true, v: true });
    default:
      throw new Error(`Aksi ${action} tidak didukung.`);
  }
};
