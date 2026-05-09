/**
 * MODULE: Real-time Deployment Streamer
 * FUNCTION: Menangani aliran data log pull image ke client
 */

import { docker } from '@/lib/docker';

export async function streamDeployment(imageData: any, responseStream: WritableStream) {
  const writer = responseStream.getWriter();
  const encoder = new TextEncoder();

  try {
    // Memulai proses penarikan Image dari Docker Hub
    const pullStream = await docker.pull(imageData.image);

    // Mengikuti progres secara asinkron
    docker.modem.followProgress(
      pullStream,
      (err, res) => {
        if (err) writer.write(encoder.encode(JSON.stringify({ status: 'error', message: err.message })));
        writer.close();
      },
      (event) => {
        // Mengirimkan fragmen status ke Client secara real-time
        const message = JSON.stringify({
          type: 'pull',
          status: event.status,
          progress: event.progress
        });
        writer.write(encoder.encode(message + '\n'));
      }
    );
  } catch (error: any) {
    writer.write(encoder.encode(JSON.stringify({ status: 'error', message: error.message })));
    writer.close();
  }
}
