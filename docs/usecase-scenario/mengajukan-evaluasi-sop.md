# Dokumen Skenario Use Case: Mengajukan Evaluasi SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengajukan Evaluasi SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengajukan Evaluasi SOP |
| **ID** | UCM-09 |
| **Aktor Utama** | PJ Penyusun |
| **Aktor Terlibat** | Sistem (Alur Pengajuan) |
| **Prasyarat** | Pengguna login (PJ_PENYUSUN). Terdapat minimal satu dokumen SOP berstatus `SIAP_DIEVALUASI` pada OPD terkait. |
| **Pemicu** | PJ Penyusun ingin menyerahkan batch dokumen SOP kepada Biro Organisasi untuk dievaluasi. |
| **Alur Utama** | 1. PJ Penyusun menekan tombol Buat Pengajuan di antarmuka evaluasi.<br>2. PJ Penyusun menyeleksi list `detailSopId` (SOP yang `SIAP_DIEVALUASI`).<br>3. Memilih jenis pengajuan (`TERJADWAL` atau `MANDIRI`).<br>4. Client HTTP POST ke endpoint `/evaluasi`.<br>5. Server memvalidasi: OPD asal tidak sedang punya pengajuan berstatus aktif (`SEDANG_DIEVALUASI` s/d `DITANDATANGANI_PJ_PENYUSUN`).<br>6. Server memverifikasi semua `detailSopId` valid, unik, berstatus `SIAP_DIEVALUASI`, dan dimiliki oleh `opdId` pengguna.<br>7. Melalui DB transaction: Membuat entitas `PengajuanEvaluasi`, instansiasi `NilaiEvaluasi` blank untuk tiap SOP, serta mengubah status tiap `DetailSOP` jadi `SEDANG_DIEVALUASI`.<br>8. Response 201 Created. |
| **Alur Alternatif** | - **OPD Masih Ada Pengajuan Aktif:** Server membatalkan aksi dengan pesan 409 Conflict, menegakkan invariant bahwa tiap OPD maksimal punya 1 pengajuan berjalan.<br>- **SOP Tidak Valid:** Terdapat SOP yang belum `SIAP_DIEVALUASI` (misal masih `DRAFT`). Transaksi digagalkan secara sistem. |
| **Hasil Akhir** | Kumpulan SOP berhasil terkunci dan dikelompokkan dalam satu entitas `PengajuanEvaluasi` untuk mulai diproses oleh tim evaluator. |
