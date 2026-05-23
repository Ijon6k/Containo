# Dokumentasi Snippet: Docker Integration

## File Referensi
- [`docker-init.ts`](./docker-init.ts)

## Tujuan Snippet
Menunjukkan pendekatan arsitektur paling dasar dari aplikasi Containo, yaitu bagaimana aplikasi Next.js/Node.js ini berkomunikasi dengan *Docker Daemon* yang berada di Host Linux tanpa mengeksekusi terminal *shell*.

## Fungsi Fitur
Memastikan aplikasi dapat mengirimkan perintah HTTP secara instan (*native*) menggunakan protokol `Unix Socket` sehingga tidak ada hambatan performa saat mengelola ribuan kontainer.

## Hubungan dengan BAB 3
Di dalam BAB 3 Skripsi/PI, sub-bab *Implementasi Lapisan Infrastruktur* atau *Konfigurasi Sistem* wajib menjelaskan titik masuk (*entry point*) aplikasi ke Docker. Kode ini menunjukkan penguasaan penulis terhadap API Docker tingkat rendah (low-level).

## Rekomendasi Screenshot (Microsoft Word)
1. **Screenshot Visual Studio Code** dari file `docker-init.ts` secara utuh.
2. Tambahkan anotasi panah atau kotak merah di sekitar baris `socketPath: '/var/run/docker.sock'`.
