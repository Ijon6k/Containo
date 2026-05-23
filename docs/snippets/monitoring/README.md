# Dokumentasi Snippet: Monitoring System Health

## File Referensi
- [`disk-health.ts`](./disk-health.ts)

## Tujuan Snippet
Mendokumentasikan bagaimana Containo mampu membaca perangkat keras fisik server dari dalam abstraksi Node.js menggunakan sistem metrik filesystem.

## Fungsi Fitur
Mengambil nilai total kapasitas disk (Storage), yang digunakan, dan yang tersisa dari Host Linux pengguna agar dapat dirender pada grafis Pie Chart/Bar Chart di Dashboard.

## Hubungan dengan BAB 3
Tepat untuk sub-bab **"Pemrosesan Data Metrik"**. Kode ini membuktikan bahwa penulis PI dapat mengolah data tingkat rendah (*low-level system calls* seperti `statfsSync`) secara manual menjadi *object* JSON yang mudah diproses lebih lanjut oleh antarmuka.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE untuk fungsi `getHostDiskInfo`.
2. Gabungkan dengan screenshot komponen UI "Storage Health" di Dashboard (sebelah kanan kode) untuk efek sebelum-dan-sesudah pemrosesan.
