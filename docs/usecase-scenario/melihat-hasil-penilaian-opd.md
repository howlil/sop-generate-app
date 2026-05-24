# Dokumen Skenario Use Case: Melihat Hasil Penilaian OPD

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Melihat Hasil Penilaian OPD"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Melihat Hasil Penilaian OPD |
| **ID** | UCM-01 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Pengolahan Laporan) |
| **Prasyarat** | Pengguna memiliki sesi aktif sebagai PJ_EVALUATOR. Telah ada pengajuan evaluasi yang selesai dari OPD. |
| **Pemicu** | PJ Evaluator memilih menu rekapitulasi penilaian OPD. |
| **Alur Utama** | 1. Pengguna membuka halaman dashboard penilaian OPD.<br>2. Sistem (Client) mengirimkan request GET ke endpoint laporan evaluasi server.<br>3. Server melakukan query ke tabel `PengajuanEvaluasi` dengan relasi `NilaiEvaluasi` untuk mengambil data skor evaluasi (`nilaiOPD`) dari OPD-OPD yang berstatus `SELESAI_DIEVALUASI`, `DIVERIFIKASI_PJ_EVALUATOR`, `DITANDATANGANI_PJ_PENYUSUN`, atau `SELESAI`.<br>4. Server mengembalikan payload daftar nilai OPD.<br>5. Sistem (Client) menampilkan data dalam bentuk tabel atau grafik untuk pengguna. |
| **Alur Alternatif** | - **Jika tidak ada pengajuan yang selesai:** Sistem (Server) mengembalikan array kosong, dan UI menampilkan pesan "Belum ada hasil penilaian tersedia." |
| **Hasil Akhir** | PJ Evaluator dapat melihat secara detail nilai dan status evaluasi SOP pada tiap OPD. |
