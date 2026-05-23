/**
 * Judul PI:
 * Prosedur Pemulihan (Restore) Data State Kontainer
 *
 * BAB 3:
 * 3.4.6 Implementasi Sistem Pengamanan Data (Volume Restore)
 *
 * Deskripsi:
 * Mengembalikan arsip .tar.gz yang diunggah pengguna kembali ke
 * volume asli Docker. Algoritma ini me-mount direktori sementara host
 * dan mengekstrak isinya langsung ke block storage Docker.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { volumeName, backupFilePath } = await req.json();
  
  try {
    // Mengekstrak file backup (.tar.gz) ke dalam mount point volume terkait
    await execAsync(`docker run --rm -v ${volumeName}:/volume -v /tmp:/backup alpine sh -c "cd /volume && tar -xzf /backup/${backupFilePath}"`);
    
    // Cleanup temporary upload file
    await execAsync(`rm -f /tmp/${backupFilePath}`);

    return NextResponse.json({ success: true, message: "Restore berhasil" });
  } catch (error) {
    return NextResponse.json({ error: 'Proses pemulihan volume gagal' }, { status: 500 });
  }
}
