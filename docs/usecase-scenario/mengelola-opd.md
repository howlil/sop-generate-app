# Dokumen Skenario Use Case: Mengelola OPD

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola OPD"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola OPD |
| **ID** | UCM-02 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Basis Data OPD) |
| **Prasyarat** | Pengguna login dengan peran PJ_EVALUATOR. |
| **Pemicu** | Pengguna ingin menambah, mengubah, atau menghapus (soft-delete) data instansi OPD. |
| **Alur Utama** | 1. Pengguna membuka menu Manajemen OPD dan menekan tombol Tambah/Ubah.<br>2. Pengguna memasukkan data nama OPD.<br>3. Client mengirim request POST/PATCH ke endpoint OPD server.<br>4. Server memvalidasi payload dan memastikan tidak ada konflik data.<br>5. Server menyimpan/memperbarui record di tabel `OPD`.<br>6. Server merespon status 200/201 sukses.<br>7. Client memperbarui daftar OPD yang ditampilkan. |
| **Alur Alternatif** | - **Gagal Validasi:** Jika nama OPD kosong, server menolak dengan HTTP 400.<br>- **Hapus Data (Soft-delete):** Jika pengguna memilih hapus, server mengisi field `deletedAt` pada entitas `OPD` alih-alih penghapusan fisik, untuk menjaga integritas relasional. |
| **Hasil Akhir** | Data OPD di tabel master terbarui secara persisten tanpa merusak relasi historis. |
