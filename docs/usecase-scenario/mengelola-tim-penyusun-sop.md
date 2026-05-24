# Dokumen Skenario Use Case: Mengelola Tim Penyusun SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola Tim Penyusun SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola Tim Penyusun SOP |
| **ID** | UCM-05 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Basis Data Pengguna) |
| **Prasyarat** | Pengguna login (PJ_EVALUATOR). Data master OPD telah tersedia. |
| **Pemicu** | Kebutuhan registrasi, pembaruan data (mutasi), atau soft-delete akun dengan peran PENYUSUN atau PJ_PENYUSUN. |
| **Alur Utama** | 1. Pengguna menavigasi ke menu Manajemen Penyusun.<br>2. Pengguna mengisi data: Nama, NIP, Email, Peran (`PENYUSUN`/`PJ_PENYUSUN`), dan memilih OPD tujuan.<br>3. Server melakukan verifikasi keunikan `email` dan `nip`.<br>4. Jika peran adalah `PJ_PENYUSUN`, server memastikan OPD tidak memiliki PJ Penyusun aktif lainnya (invariant check).<br>5. Server menyimpan entri ke tabel `Pengguna` dan tabel `RiwayatOpdPengguna` dengan transaksi atomik.<br>6. Client mengindikasikan status berhasil. |
| **Alur Alternatif** | - **Mutasi OPD:** Pengguna mengganti `opdId` suatu penyusun. Server meng-update `Pengguna.opdId`, mengubah `isAktif = false` pada `RiwayatOpdPengguna` lama, dan membuat record aktif untuk OPD baru.<br>- **Invariant PJ Penyusun:** Bila mencoba menambah lebih dari satu `PJ_PENYUSUN` di satu OPD, server membatalkan aksi (rollback). |
| **Hasil Akhir** | Status dan lokasi penugasan tim penyusun termutakhirkan dengan rekam jejak historis (`RiwayatOpdPengguna`) yang konsisten. |
