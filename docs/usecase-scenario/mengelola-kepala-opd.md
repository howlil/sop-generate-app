# Dokumen Skenario Use Case: Mengelola Kepala OPD

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola Kepala OPD"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola Kepala OPD |
| **ID** | UCM-04 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Validasi Relasi OPD) |
| **Prasyarat** | Pengguna login dengan peran PJ_EVALUATOR. |
| **Pemicu** | Pengguna perlu mengatur akun pimpinan/Kepala untuk suatu OPD. |
| **Alur Utama** | 1. Pengguna membuka antarmuka manajemen Kepala OPD.<br>2. Pengguna menginputkan data Kepala OPD untuk suatu entitas OPD spesifik (peran `KEPALA_OPD`).<br>3. Client mengirimkan payload.<br>4. Server menjalankan validasi bisnis invariant: memastikan tidak ada `Pengguna` lain yang masih aktif (`deletedAt = null`) dengan peran `KEPALA_OPD` untuk `opdId` tersebut.<br>5. Server melakukan operasi penambahan `Pengguna` dan pencatatan awal ke `RiwayatOpdPengguna` secara atomik.<br>6. Client menampilkan notifikasi sukses. |
| **Alur Alternatif** | - **Pelanggaran Invariant Kepala OPD:** Jika OPD tersebut sudah memiliki Kepala OPD aktif, server menolak request dan membatalkan transaksi untuk mencegah ambiguitas pengesahan dokumen. Pengguna diminta menonaktifkan Kepala OPD lama terlebih dahulu. |
| **Hasil Akhir** | Akun Kepala OPD terikat dengan aman ke OPD yang bersangkutan tanpa melanggar aturan single-leadership per instansi. |
