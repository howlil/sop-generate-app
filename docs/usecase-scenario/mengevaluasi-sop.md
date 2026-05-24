# Dokumen Skenario Use Case: Mengevaluasi SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengevaluasi SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengevaluasi SOP |
| **ID** | UCM-07 |
| **Aktor Utama** | Evaluator |
| **Aktor Terlibat** | Sistem (Audit Trail Nilai) |
| **Prasyarat** | Pengajuan evaluasi berstatus `SEDANG_DIEVALUASI` untuk OPD bersangkutan tersedia. |
| **Pemicu** | Evaluator mulai melakukan inspeksi dokumen langkah demi langkah pada SOP yang diajukan. |
| **Alur Utama** | 1. Evaluator membuka antarmuka pemeriksaan (workbench) untuk satu `DetailSOP` spesifik dari suatu pengajuan.<br>2. Evaluator memberikan status penilaian akhir (`SESUAI`).<br>3. Client mengirim request PATCH ke `/evaluasi/:pengajuanId/nilai/:detailSopId`.<br>4. Server memeriksa `NilaiEvaluasi.version` (Optimistic Locking) untuk mencegah race-condition.<br>5. Server mengubah `NilaiEvaluasi.hasil` menjadi `SESUAI` dan mengosongkan tindak lanjut.<br>6. Server merekam histori ke tabel `LogNilaiEvaluasi`.<br>7. Client menandai SOP tersebut selesai dievaluasi pada UI. |
| **Alur Alternatif** | - **Locking Conflict:** Jika `version` di database lebih baru (di-edit oleh evaluator lain bersamaan), server me-return HTTP 409 Conflict.<br>- **Semua Selesai:** Jika evaluator menekan "Selesai Evaluasi Pengajuan", server mengecek semua `NilaiEvaluasi` wajib `SESUAI`. Jika terpenuhi, status `PengajuanEvaluasi` di-update jadi `SELESAI_DIEVALUASI`. |
| **Hasil Akhir** | Status penilaian tersimpan pada tabel `NilaiEvaluasi` dengan integritas concurrent access terjaga. |
