# Dokumentasi Snippet: Container Management

## File Referensi
- [`lifecycle-api.ts`](./lifecycle-api.ts)

## Tujuan Snippet
Mendokumentasikan bagaimana routing API dinamis pada framework Next.js 14+ (App Router) dibangun untuk melayani permintaan eksekusi perintah kontainer.

## Fungsi Fitur
Memungkinkan aksi antarmuka (klik tombol Start/Stop) dari pengguna diubah menjadi aksi jaringan yang memicu perubahan status (state) pada Docker container melalui Dockerode.

## Hubungan dengan BAB 3
Sangat relevan untuk Sub-bab **"Pembuatan API Backend"** atau **"Implementasi RESTful Controller"**. Menggambarkan bahwa penulis tidak meletakkan logika secara serampangan di UI, tetapi membuat endpoint API yang rapi, terpusat, dan dilindungi oleh `withErrorHandler`.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE dari file `lifecycle-api.ts`.
2. Screenshot UI Dashboard (Frontend) di mana tombol `Play`/`Stop` berada, disejajarkan untuk memperlihatkan hubungan Front-Back.
