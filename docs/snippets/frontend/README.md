# Dokumentasi Snippet: Arsitektur UI Frontend

## File Referensi
- [`container-form-schema.ts`](./container-form-schema.ts)
- [`system-stats-card.tsx`](./system-stats-card.tsx)

## Tujuan Snippet
Mendokumentasikan lapisan visual aplikasi (Presentation Layer) yang mematuhi paradigma modern pengembangan React (Next.js).

## Fungsi Fitur
- **Schema Zod**: Bertanggung jawab membentengi data konfigurasi sebelum melaju ke Backend.
- **Stats Card**: Komponen pengikat data dinamis (Data Binding) yang merespons event dari Websocket tanpa lag.

## Hubungan dengan BAB 3
Komponen ini sangat krusial untuk dimasukkan di **Sub-bab Perancangan Antarmuka Pengguna** (UI Design & Implementation). Membuktikan bahwa skripsi/PI Anda tidak hanya menampilkan kode HTML kosongan, tetapi benar-benar memanfaatkan teknologi reaktif mutakhir seperti *Framer Motion* untuk interaksi grafis yang fluid.

## Rekomendasi Screenshot (Microsoft Word)
1. **Untuk Schema:** Buka file `container-form-schema.ts` dan *capture* seluruh variabel Zod Object-nya. Tambahkan Screenshot Alert Error pada form jika nama kontainer tidak valid.
2. **Untuk Stats Card:** *Capture* kode fungsional React dan kombinasikan dengan hasil visual grafis (Card Metrik CPU di Dashboard) sebagai bukti implementasi nyata.
