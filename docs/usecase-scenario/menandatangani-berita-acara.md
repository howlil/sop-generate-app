# Dokumen Skenario Use Case: Menandatangani Berita Acara

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Menandatangani Berita Acara"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Menandatangani Berita Acara |
| **ID** | UCM-06 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Proses Legalisasi) |
| **Prasyarat** | Terdapat pengajuan evaluasi berstatus `SELESAI_DIEVALUASI`. PJ Evaluator sudah mengatur PIN TTE. |
| **Pemicu** | Pengajuan yang selesai dievaluasi memerlukan verifikasi administratif (Berita Acara). |
| **Alur Utama** | 1. Pengguna memilih pengajuan berstatus `SELESAI_DIEVALUASI` dan menekan tombol Tandatangani Berita Acara.<br>2. Pengguna memasukkan PIN TTE miliknya.<br>3. Server memverifikasi input PIN dengan `Pengguna.ttePinHash`.<br>4. Server memastikan invariant: `PengajuanEvaluasi.status` adalah `SELESAI_DIEVALUASI`.<br>5. Dalam satu transaksi DB: Server mengubah status pengajuan menjadi `DIVERIFIKASI_PJ_EVALUATOR`. Server membuat entitas `DokumenTte` jika belum ada, lalu mengisikan record `RiwayatTandaTangan` dengan peran `PJ_EVALUATOR`.<br>6. Status SOP tidak berubah secara individual dalam tahap ini. |
| **Alur Alternatif** | - **PIN Salah:** Server (endpoint POST `/tte/tanda-tangani/ba`) mengembalikan HTTP 401 Unauthorized.<br>- **Double Sign:** Jika mencoba tanda tangan dua kali untuk peran yang sama, sistem DB menolak karena `@@unique([dokumenTteId, peran])`. |
| **Hasil Akhir** | Dokumen Berita Acara sah dari sisi Biro Organisasi, pengajuan dilanjutkan ke tahapan tanda tangan PJ Penyusun OPD. |
