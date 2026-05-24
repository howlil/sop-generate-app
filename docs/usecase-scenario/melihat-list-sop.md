# Dokumen Skenario Use Case: Melihat List SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Melihat List SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Melihat List SOP |
| **ID** | UCM-10 |
| **Aktor Utama** | Kepala OPD |
| **Aktor Terlibat** | Sistem |
| **Prasyarat** | Pengguna aktif peran `KEPALA_OPD`. |
| **Pemicu** | Pemantauan berkala dokumen-dokumen internal instansi. |
| **Alur Utama** | 1. Kepala OPD meload dashboard OPD.<br>2. Request API GET dilakukan. Server secara restriktif menggunakan filtering JWT `opdId` untuk menarik `SOP`.<br>3. Sistem mengagregat hasil join tabel dan mengembalikan susunan SOP (termasuk yang `BERLAKU`, `SEDANG_DIEVALUASI`, dsb).<br>4. Client menampilkan grid/list monitor status dokumen. |
| **Alur Alternatif** | - |
| **Hasil Akhir** | Transparansi dan visibilitas dokumen regulasi per instansi terpampang jelas. |
