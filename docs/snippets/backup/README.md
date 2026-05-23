# Dokumentasi Snippet: Volume Backup System

## File Referensi
- [`volume-backup.ts`](./volume-backup.ts)

## Tujuan Snippet
Mendokumentasikan bagaimana sebuah platform manajemen kontainer wajib memfasilitasi perlindungan dan retensi data secara otomatis.

## Fungsi Fitur
Mengambil Volume (penyimpanan persisten) Docker dan mengubahnya menjadi format biner terkompresi `.tar.gz` yang aman. Hal ini dilakukan dengan trik mengeksekusi kontainer pembantu (*helper container*) Alpine Linux sementara.

## Hubungan dengan BAB 3
Sangat berbobot untuk sub-bab **"Mekanisme Failover & Pengamanan Data"**. Skripsi Manajemen Server biasanya mewajibkan fitur backup. Kode ini memperlihatkan kemampuan integrasi tingkat mahir dengan memanggil *Child Process* sistem Unix dari dalam lingkungan backend JavaScript.

## Rekomendasi Screenshot (Microsoft Word)
1. *Capture* khusus dari baris ke-20 (`await execAsync...`) karena ini adalah "Jantung" (*core logic*) dari seluruh proses *tarball* arsip.
2. Lampirkan screenshot panel antarmuka aplikasi Containo saat tombol "Start Backup" ditekan dan memunculkan *loading spinner*.
