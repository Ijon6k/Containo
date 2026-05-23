/**
 * Judul PI:
 * Manajemen Kebersihan Sistem (System Prune) untuk Efisiensi Penyimpanan
 *
 * BAB 3:
 * 3.4.7 Automasi Maintenance dan Garbage Collection
 *
 * Deskripsi:
 * Mengeksekusi API Docker untuk membersihkan images yang tidak memiliki
 * tag (dangling), kontainer yang sudah mati, serta jaringan yang tak terpakai.
 * Melindungi memori Host dari masalah kebocoran data (storage leak) pasca-deployment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { withErrorHandler } from '@/lib/utils/api-handler';

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Membersihkan semua images yang bersatus 'dangling' (tidak bertuan)
  const imagePruneResult = await docker.pruneImages({ filters: { dangling: { 'true': true } } });
  
  // Membersihkan container yang berstatus 'exited'
  const containerPruneResult = await docker.pruneContainers();

  return NextResponse.json({ 
    success: true, 
    reclaimedSpace: imagePruneResult.SpaceReclaimed || 0,
    containersDeleted: containerPruneResult.ContainersDeleted?.length || 0
  });
});
