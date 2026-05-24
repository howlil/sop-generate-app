# Dokumen Skenario Use Case: Mengesahkan Dokumen SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengesahkan Dokumen SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengesahkan Dokumen SOP |
| **ID** | UCM-11 |
| **Aktor Utama** | Kepala OPD |
| **Aktor Terlibat** | Sistem (Finalisasi State Engine) |
| **Prasyarat** | Terdapat `PengajuanEvaluasi` yang telah berada di tahap final pra-pengesahan, yaitu status `DITANDATANGANI_PJ_PENYUSUN`. Semua SOP di dalamnya berstatus `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI`. |
| **Pemicu** | Kepala OPD perlu mengaktifkan legalitas implementasi SOP-SOP tersebut ke domain publik (Arsip). |
| **Alur Utama** | 1. Kepala OPD mengecek modul Persetujuan (Pengesahan) pada sistem.<br>2. Memilih pengajuan spesifik, dan memicu aksi pengesahan massal SOP (Endpoint POST `/tte/tanda-tangani/pengajuan/:id/sop-semua`).<br>3. Kepala OPD memvalidasi kredensial PIN TTE.<br>4. Server memverifikasi kecocokan PIN hash kriptografik.<br>5. Dalam satu super-transaksi database atomik yang besar: <br>   - Untuk setiap SOP di pengajuan: Server me-record `RiwayatTandaTangan` dengan peran Kepala OPD.<br>   - Server membuat/memperbarui data fisik meta `DokumenTte` jenis `SOP_BERLAKU`.<br>   - Server mengotomatisasi pengalihan versi lama SOP (yang sebelumnya punya tag `BERLAKU`) diturunkan statusnya menjadi `DIGANTIKAN` agar arsip publik tersinkron secara murni.<br>   - Server merubah status list `DetailSOP` tersebut memuncak jadi `BERLAKU` serta menyuntikkan data timestamp ke `tanggalEfektif` (tanggal hari eksekusi berdasarkan tz/WIB).<br>   - Server secara final mengunci master status `PengajuanEvaluasi` menjadi terminal node `SELESAI`.<br>6. Response HTTP 200/201 dikembalikan, UI memberikan notifikasi glorifikasi kesuksesan legalisasi regulasi formal. |
| **Alur Alternatif** | - **PIN Meleset:** Evaluasi keamanan gagal dengan HTTP 401. Data tidak dimutasi.<br>- **Transaction Failure:** Jika satu saja proses mutasi sub-data gagal (contoh server down atau anomali jaringan di tengah transisi), mekanisme RDBMS atomicity me-rollback semua pengesahan, tidak ada pengesahan parsial SOP untuk menjaga reliabilitas institusi. |
| **Hasil Akhir** | Dokumen SOP secara dejure aktif dan diekspos melalui API publik (menjadi Arsip Digital). |
