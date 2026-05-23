# Dokumentasi Snippet: Dashboard Overview

## File Referensi
- [`overview-stats.ts`](./overview-stats.ts)

## Tujuan Snippet
Mendemonstrasikan fitur unggulan di halaman Dashboard utama yang mampu menghitung status kesehatan (Health Score) ekosistem Docker secara otomatis.

## Fungsi Fitur
Mengabstraksikan kompleksitas pengecekan ratusan kontainer menjadi satu skor (0-100) yang *user-friendly*, serta memberitahu pengguna tentang masalah *hygiene* sistem (terlalu banyak file *dangling* / sisa build).

## Hubungan dengan BAB 3
Relevan untuk sub-bab **"Perancangan Dashboard dan Logika Bisnis"**. Sangat cocok karena menyoroti aspek akademik dari perancangan formula skoring kesehatan perangkat lunak.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE untuk fungsi `getSystemHealth`.
2. Screenshot Gauge UI (Indikator Melingkar) bertuliskan skor "90/100" dari halaman beranda (Homepage) Containo.
