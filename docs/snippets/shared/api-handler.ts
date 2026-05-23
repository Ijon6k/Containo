/**
 * Judul PI:
 * Arsitektur Wrapper Penanganan Kesalahan (Error Handling) Sentral
 *
 * BAB 3:
 * 3.3.5 Implementasi Mekanisme Toleransi Kesalahan (Fault Tolerance)
 *
 * Deskripsi:
 * Higher-Order Function (HOF) untuk membungkus (wrap) semua API Route.
 * Secara otomatis menangkap error fatal dari Docker daemon agar
 * server tidak mati mendadak (crash) dan merespon dengan status HTTP
 * yang informatif ke pihak Frontend.
 */

import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (req: NextRequest, ctx: any) => Promise<NextResponse>;

export const withErrorHandler = (handler: RouteHandler) => {
  return async (req: NextRequest, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (error: any) {
      // Mendeteksi error koneksi docker daemon
      if (error?.code === 'ENOENT' && error?.syscall === 'connect') {
        return NextResponse.json(
          { error: 'Docker daemon tidak aktif atau socket terputus.' }, 
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
};
