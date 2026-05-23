# Dokumentasi Snippet: Realtime Monitoring dengan WebSockets

## File Referensi
- [`ws-rooming.ts`](./ws-rooming.ts)

## Tujuan Snippet
Menjelaskan bagaimana masalah keterlambatan (latensi) dalam memantau CPU/RAM diselesaikan menggunakan arsitektur *Pub/Sub* dua arah.

## Fungsi Fitur
Memastikan data grafik metrik pada *Frontend* berjalan mulus tanpa harus me-*refresh* halaman, sekaligus menghindari overhead HTTP Polling tradisional yang memboroskan jalur (*bandwidth*) jaringan.

## Hubungan dengan BAB 3
Sangt krusial untuk bagian **"Arsitektur Komunikasi Sistem"**. Potongan ini menggarisbawahi efisiensi, di mana server dengan cerdas mengecek ketersediaan `clientsInRoom` sebelum mematikan aliran CPU Docker sehingga server tetap berkinerja baik walau ribuan kontainer berjalan.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE dari file `ws-rooming.ts`.
2. Ilustrasi diagram alur kecil jika ada (Klien -> Join Room -> Docker Stream -> Update Grafis).
