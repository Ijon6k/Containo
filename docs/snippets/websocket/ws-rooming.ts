/**
 * Judul PI:
 * Mekanisme Efisiensi Streaming Data dengan Pola Rooming WebSocket
 *
 * BAB 3:
 * 3.4.5 Perancangan Server WebSocket Event-Driven
 *
 * Deskripsi:
 * Menggunakan fitur Socket.io 'rooms' untuk menyiarkan metrik CPU/RAM 
 * HANYA kepada klien yang membutuhkan (membuka halaman dashboard).
 * Jika tidak ada klien di dalam room, proses streaming dihentikan 
 * guna meminimalisir beban I/O memori di server.
 */

import { Server, Socket } from 'socket.io';
import { startStatsStream, stopStatsStream } from './streamer'; 

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {

    socket.on('stats:subscribe', (id: string) => {
      const room = `stats:${id}`;
      socket.join(room); // Klien diisolasi dalam sub-jaringan (room)
      startStatsStream(io, id); // Daemon Docker mulai memutar stream CPU
    });

    socket.on('stats:unsubscribe', (id: string) => {
      const room = `stats:${id}`;
      socket.leave(room);
      
      const clientsInRoom = io.sockets.adapter.rooms.get(room);
      if (!clientsInRoom || clientsInRoom.size === 0) {
        stopStatsStream(id); // Shutdown stream bila tidak ada audiens
      }
    });

  });
}
