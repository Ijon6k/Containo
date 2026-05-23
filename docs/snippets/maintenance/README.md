# Dokumentasi Snippet: Automasi Maintenance

## File Referensi
- [`system-prune.ts`](./system-prune.ts)

## Tujuan Snippet
Menunjukkan bahwa aplikasi Containo tidak hanya membuat dan mematikan kontainer, tetapi memiliki fitur *Self-Healing* dan *Garbage Collection* terhadap sumber daya perangkat keras server.

## Fungsi Fitur
Memerintahkan Docker API untuk menghapus *image* tak berlabel (*dangling images*) dan *container* yang mati tanpa harus menyentuh terminal (`docker system prune`), guna mengembalikan ruang *storage* (Space Reclaimed).

## Hubungan dengan BAB 3
Penempatan terbaik ada pada sub-bab **"Automasi Pemeliharaan (Maintenance) Sistem"**. Snippet ini menguatkan argumen bahwa sistem memiliki siklus hidup yang sehat (*healthy lifecycle*), membedakan skripsi Anda dari aplikasi CRUD biasa yang sering mengabaikan manajemen memori.

## Rekomendasi Screenshot (Microsoft Word)
1. Screenshot IDE dari file `system-prune.ts` mulai dari pemanggilan fungsi `docker.pruneImages()`.
2. Screenshot Notifikasi atau Kartu Statistik di UI yang bertuliskan "X GB Space Reclaimed Successfully!".
