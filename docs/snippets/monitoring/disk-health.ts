/**
 * Judul PI:
 * Algoritma Agregasi Kapasitas Penyimpanan Fisik (Host)
 *
 * BAB 3:
 * 3.5.1 Kalkulasi Ekstraksi Metrik Penyimpanan Sistem Operasi
 *
 * Deskripsi:
 * Menggunakan modul Node.js 'fs.statfsSync' untuk menembus abstraksi
 * container dan mendapatkan ukuran native block fisik di tingkat Host.
 * Menghitung kapasitas yang dapat dipakai oleh user dengan mengalikan
 * bfree (free blocks) dengan bsize (block size).
 */

import fs from 'fs';

export const getHostDiskInfo = () => {
  let hostDisk = { total: 1, free: 0, used: 0 };
  try {
    const targetPath = fs.existsSync('/host') ? '/host' : '/';
    const stats = fs.statfsSync(targetPath); // low-level syscall statfs
    
    hostDisk = {
      total: Number(stats.blocks) * stats.bsize,
      free: Number(stats.bfree) * stats.bsize,
      used: (Number(stats.blocks) - Number(stats.bfree)) * stats.bsize
    };
  } catch (e) { }
  return hostDisk;
};
