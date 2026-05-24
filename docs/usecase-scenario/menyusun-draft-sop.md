# Dokumen Skenario Use Case: Menyusun Draft SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Menyusun Draft SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Menyusun Draft SOP |
| **ID** | UCM-14 |
| **Aktor Utama** | PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Authoring Core) |
| **Prasyarat** | Sistem memiliki SOP berstatus dapat diedit (`DRAFT`, `SEDANG_DISUSUN`, `REVISI_DARI_EVALUATOR`). |
| **Pemicu** | Pembuatan substansi konten dokumen prosedur secara utuh, perbaikan dari draft kasar, atau menindaklanjuti revisi evaluator. |
| **Alur Utama** | 1. Pengguna (Penyusun / PJ Penyusun) mengakses workbench authoring (endpoint `/sop/penyusun-workbench/:id`).<br>2. Melakukan modifikasi elemen header, lampiran, perancangan dasar hukum, serta menambahkan array data `LangkahSOP` dan pelaksana (`DetailSOPPelaksana`).<br>3. Client me-replace array keseluruhan dengan mengirim PATCH ke server.<br>4. Server memvalidasi urutan langkah yang dikirim.<br>5. Server memvalidasi invariant langkah khusus: Jenis langkah `KEPUTUSAN` wajib punya relasi pointer ke langkah `Ya` dan `Tidak` dalam dokumen yang sama.<br>6. Transaksi database replace-all langkah berjalan. Tabel `LogEditSOP` mendokumentasikan log audit modifikasi data domain.<br>7. UI diperbarui. Bila telah utuh memanggil trigger status akhir PATCH ke `/sop/status/:detailSopId`.<br>8. Server memverifikasi kelengkapan. Bila valid, server mengalihkan status ke `SIAP_DIEVALUASI`. |
| **Alur Alternatif** | - **Edit SOP Berlaku:** Jika UI/API dipaksa mengedit SOP yang statusnya `BERLAKU` atau `SEDANG_DIEVALUASI`, server mengembalikan respon HTTP 403 Forbidden. Dokumen sudah frozen.<br>- **Penyusunan Flowchart Diagram:** UI otomatis menggenerasikan konfigurasi node, jika pengguna men-tweak garis diagram, tersimpan di tabel `KonfigurasiDiagramSOP`.<br>- **SOP Inkomplit:** Saat menekan "Tandai Siap Dievaluasi", aplikasi memvalidasi mendalam. Bila teridentifikasi error (langkah kosong, dll), ditolak HTTP 400. Draft batal dinaikkan state-nya. |
| **Hasil Akhir** | Bentuk teknis prosedur tersimpan akurat dan/atau DetailSOP berganti status menjadi kesiapan pasif (`SIAP_DIEVALUASI`) menunggu aksi pengajuan evaluasi. |
