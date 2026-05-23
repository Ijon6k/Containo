# Dokumentasi Snippet: Shared Utilities

## File Referensi
- [`api-handler.ts`](./api-handler.ts)

## Tujuan Snippet
Mendemonstrasikan penerapan teknik abstraksi (*Higher-Order Function*) agar ribuan baris kode pada API tidak berulang.

## Fungsi Fitur
Menjadi pelindung sentral bagi seluruh *endpoint* REST API. Jika sewaktu-waktu Docker Daemon di Host di-hentikan (dimatikan) secara paksa oleh sistem operasi, kode ini akan mencegat pesan *error* dan merespon dengan HTTP 503 Service Unavailable dengan elegan, bukan membiarkan proses NodeJS Next.js hancur.

## Hubungan dengan BAB 3
Penempatan ideal pada sub-bab **"Mekanisme Penanganan Kesalahan (Error Handling)"**. Fitur ini membedakan arsitektur *production-grade* modern yang mementingkan aspek stabilitas dari arsitektur tugas mahasiswa biasa.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot dari snippet kode `api-handler.ts`.
2. Ilustrasi sederhana: (Setiap File API) -> `withErrorHandler` -> Eksekusi.
