/**
 * Judul PI:
 * Validasi Konfigurasi Skema Kontainer Menggunakan Clean Architecture
 *
 * BAB 3:
 * 3.3.4 Implementasi User Interface dan Validasi Data (Frontend)
 *
 * Deskripsi:
 * Menggunakan arsitektur pemisahan UI dari logika validasi (Zod Schema).
 * Memaksa pengguna mengisi formulir sesuai standar Docker (contoh: regex
 * karakter huruf/angka pada nama kontainer) sehingga API tidak akan 
 * pernah menerima Payload bermasalah.
 */

import { z } from 'zod';

export const containerFormSchema = z.object({
  name: z.string()
         .min(1, 'Container name is required')
         .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/, 'Invalid format'),
  image: z.string().min(1, 'Image is required'),
  ports: z.string().optional(),
  restartPolicy: z.enum(['no', 'always', 'on-failure', 'unless-stopped']),
  volumes: z.string().optional(),
});

export type ContainerFormValues = z.infer<typeof containerFormSchema>;
