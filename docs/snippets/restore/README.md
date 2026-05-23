# Dokumentasi Snippet: Volume Restore System

## File Referensi
- [`volume-restore.ts`](./volume-restore.ts)

## Tujuan Snippet
Melengkapi alur pengamanan data dengan kemampuan untuk mengembalikan *state* kontainer yang rusak atau hilang (*Disaster Recovery*).

## Fungsi Fitur
Mengekstrak kembali arsip cadangan (misal: `backup_mysql_data.tar.gz`) menggunakan lingkungan kontainer Alpine terisolasi dan menaruh seluruh direktori asli kembali ke dalam Docker Volume yang ditargetkan pengguna.

## Hubungan dengan BAB 3
Berpasangan secara langsung dengan sub-bab Snippet Backup. Menulis algoritma *Restore* memberikan sinyal kepada penguji skripsi bahwa mahasiswa tidak hanya bisa *backup* setengah jalan, namun dapat memikirkan kelengkapan fungsional pemulihan (*Rollback System*).

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE dari baris eksekusi `tar -xzf`.
2. Ilustrasi diagram panah (opsional): "File Backup" -> "Alpine Helper" -> "Docker Volume".
3. UI Modal "Upload Backup File" dari aplikasi Containo.
