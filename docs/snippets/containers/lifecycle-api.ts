/**
 * Judul PI:
 * Implementasi RESTful API untuk Siklus Hidup Container
 *
 * BAB 3:
 * 3.4.2 Implementasi Controller Backend Container Management
 *
 * Deskripsi:
 * Penggunaan fungsi switch-case untuk menangani request Start, Stop,
 * dan Restart dari Dashboard. Dibungkus dengan wrapper 'withErrorHandler'
 * untuk menolak aksi invalid tanpa membuat server crash.
 */

import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { withErrorHandler } from '@/lib/utils/api-handler';

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { action } = await req.json(); 
  const container = docker.getContainer(id);

  switch (action) {
    case 'start': await container.start(); break;
    case 'stop': await container.stop(); break;
    case 'restart': await container.restart(); break;
    case 'delete': await container.remove({ force: true }); break;
    default: return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ success: true, action });
});
