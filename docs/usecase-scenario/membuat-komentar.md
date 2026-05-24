# Dokumen Skenario Use Case: Membuat Komentar

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Membuat Komentar"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Membuat Komentar |
| **ID** | UCM-08 |
| **Aktor Utama** | Evaluator |
| **Aktor Terlibat** | Sistem (Tindak Lanjut & Transisi Status) |
| **Prasyarat** | Evaluator menemukan kekurangan pada dokumen `DetailSOP` yang dievaluasi. |
| **Pemicu** | Evaluator memberikan keputusan evaluasi `PERLU_PERBAIKAN` (Extend dari Mengevaluasi SOP). |
| **Alur Utama** | 1. Evaluator memilih hasil penilaian `PERLU_PERBAIKAN`.<br>2. Evaluator diwajibkan menulis catatan resmi (komentar) evaluasi pada textbox yang disediakan.<br>3. Server menerima payload evaluasi.<br>4. Server memeriksa keabsahan isi string catatan (wajib tidak kosong).<br>5. Server mem-persis nilai `PERLU_PERBAIKAN` dan mengisi field `catatan` pada tabel `NilaiEvaluasi`.<br>6. Server menyetel `NilaiEvaluasi.statusTindakLanjut` menjadi `TERBUKA`.<br>7. Server mengubah `DetailSOP.status` menjadi `REVISI_DARI_EVALUATOR` sehingga dokumen kembali editable oleh penyusun. |
| **Alur Alternatif** | - **Lupa Input Catatan:** Jika payload kosong untuk catatan perbaikan, server menolak eksekusi (HTTP 422 Unprocessable Entity).<br>- **Penilaian Ulang:** Setelah penyusun memperbaiki SOP, dokumen dikirim ulang, dan evaluator dapat kembali mengubah hasil menjadi `SESUAI` dan `catatan` dikosongkan/ditutup. |
| **Hasil Akhir** | SOP masuk ke state `REVISI_DARI_EVALUATOR` dan catatan umpan balik resmi tersimpan memblokir kelanjutan evaluasi hingga diselesaikan. |
