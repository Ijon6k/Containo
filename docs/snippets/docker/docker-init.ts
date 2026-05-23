/**
 * Judul PI:
 * Koneksi Host Docker Daemon Menggunakan Unix Socket
 *
 * BAB 3:
 * 3.3.1 Implementasi Lapisan Infrastruktur (Docker Connection)
 *
 * Deskripsi:
 * Menginisialisasi Singleton Dockerode dengan '/var/run/docker.sock'.
 * Pendekatan ini merupakan best-practice untuk menghindari overhead CLI
 * dan menghindari potensi command-injection.
 */

import Docker from 'dockerode';

export const docker = new Docker({ 
  socketPath: '/var/run/docker.sock' 
});
