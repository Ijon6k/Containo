/**
 * Judul PI:
 * Prosedur Pencadangan (Backup) Otomatis Data Volume Kontainer
 *
 * BAB 3:
 * 3.4.6 Implementasi Sistem Pengamanan Data (Volume Backup)
 *
 * Deskripsi:
 * Menggunakan shell execution atau Docker API untuk membuat arsip (.tar.gz) 
 * dari volume yang dikelola Docker. Proses ini krusial untuk mencegah
 * hilangnya state atau database aplikasi saat terjadi disaster.
 */

import { NextRequest, NextResponse } from 'next/server';
import { docker } from '@/lib/core/docker';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { volumeName } = await req.json();
  const backupFilename = `${volumeName}_backup_${Date.now()}.tar.gz`;
  const backupPath = `/tmp/${backupFilename}`;

  try {
    // Mengeksekusi kontainer sementara (alpine) untuk memampatkan volume
    await execAsync(`docker run --rm -v ${volumeName}:/volume -v /tmp:/backup alpine tar -czf /backup/${backupFilename} -C /volume .`);
    
    return NextResponse.json({ success: true, file: backupPath });
  } catch (error) {
    return NextResponse.json({ error: 'Proses backup volume gagal' }, { status: 500 });
  }
}
