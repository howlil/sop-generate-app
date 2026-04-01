# Requirements: Sistem Informasi SOP Biro Organisasi

**Defined:** 2026-03-15
**Updated:** 2026-04-01 (aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3)
**Core Value:** Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

**Single Source of Truth:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Use case dan spesifikasi fungsional

---

## v1.0 Requirements — Backend Implementation

Sumber: UI prototype client sudah lengkap. Backend dibangun untuk merealisasikan alur kerja yang sudah ada di client.

---

### Database & Infrastruktur

- [x] **DB-01**: Skema Prisma mengimplementasikan seluruh 20 tabel ERD yang disetujui (OPD, Pengguna, SOP, DetailSOP, Peraturan, LangkahSOP, DiagramLayout, DiagramNodePosition, DiagramEdge, DiagramEdgePoint, Pelaksana, DetailSOPPelaksana, AnggotaTimPenyusun, AnggotaTimEvaluasi, PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi, KredensialTTE, RiwayatTandaTangan, LogEditSOP)
- [x] **DB-02**: Semua relasi antar tabel (FK, constraints) terdefinisi dengan benar di schema dengan delete behavior yang tepat (Cascade/Restrict/SetNull)
- [x] **DB-03**: Enum Prisma untuk semua status field (StatusSOP, StatusPeraturan, StatusKeanggotaan, HasilEvaluasi, JenisPengajuanEvaluasi, StatusPengajuanEvaluasi, PeranTTE, BagianSOP, GayaPanah, StatusKomentar)
- [x] **DB-04**: Migration Prisma dapat dijalankan clean pada database MariaDB kosong
- [x] **DB-05**: Indexing strategy untuk FK dan query pattern umum (per opdId, per status, per userId)

---

### Auth & Users

- [x] **AUTH-01**: User dapat login dengan email dan password, mendapat JWT access token
- [x] **AUTH-02**: JWT token mengandung userId, role, dan opdId (untuk filtering data per OPD)
- [x] **AUTH-03**: Setiap endpoint terproteksi oleh JWT guard (kecuali `/auth/login` dan `/health`)
- [x] **AUTH-04**: Guard role memastikan endpoint hanya dapat diakses role yang sesuai
- [x] **AUTH-05**: Admin Biro Organisasi dapat membuat akun user baru dengan role tertentu dan password default
- [x] **AUTH-06**: User dapat mengubah password sendiri
- [x] **AUTH-07**: Constraint 1 KEPALA_OPD aktif per OPD — enforce via service layer (SELECT FOR UPDATE)
- [x] **AUTH-08**: Constraint 1 KOORDINATOR_TIM_PENYUSUN aktif per OPD — enforce via service layer (SELECT FOR UPDATE)

---

### OPD

- [x] **OPD-01**: Biro Organisasi dapat melihat daftar semua OPD
- [x] **OPD-02**: Biro Organisasi dapat membuat OPD baru
- [x] **OPD-03**: Biro Organisasi dapat mengupdate data OPD
- [x] **OPD-04**: Biro Organisasi dapat menonaktifkan OPD (soft-delete via deletedAt) dengan validasi tidak ada pengajuan evaluasi aktif
- [x] **OPD-05**: Kepala OPD dan Tim Penyusun hanya dapat melihat data OPD miliknya
- [x] **OPD-06**: Response OPD menyertakan agregat: totalSOP, sopBerlaku, sopDraft
- [x] **OPD-07**: Constraint OPD tidak bisa dihapus kalau masih ada child entities (Restrict delete)

---

### Peraturan

- [x] **PRT-01**: User dapat melihat daftar peraturan yang berlaku
- [x] **PRT-02**: Biro Organisasi dapat membuat peraturan baru (status BERLAKU)
- [x] **PRT-03**: Biro Organisasi dapat mengupdate peraturan (otomatis increment version)
- [x] **PRT-04**: Biro Organisasi dapat mencabut peraturan (status → DICABUT)
- [x] **PRT-05**: Response peraturan menyertakan jumlah SOP yang menggunakannya (`digunakan`)
- [x] **PRT-06**: Constraint scope OPD — Tim Penyusun hanya bisa melihat/perbaiki Peraturan milik OPD-nya sendiri
- [x] **PRT-07**: Constraint Peraturan berstatus DICABUT tidak boleh dijadikan DasarHukum untuk SOP baru
- [x] **PRT-08**: Unique constraint [opdId, nomor, tahun] — dalam satu OPD tidak boleh ada duplikat
- [x] **PRT-09**: Constraint Peraturan tidak bisa dihapus kalau masih dipakai sebagai DasarHukum (Restrict)

---

### SOP — Core Lifecycle

- [x] **SOP-01**: Tim Penyusun dapat membuat SOP baru (status awal: DRAFT) dengan nomor otomatis `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]`
- [x] **SOP-02**: Tim Penyusun dapat mengupdate metadata dan konten DetailSOP selama status DRAFT atau SEDANG_DISUSUN; juga bisa edit ulang jika status REVISI_DARI_TIM_EVALUASI
- [x] **SOP-03**: Tim Penyusun dapat mengubah status DetailSOP dari DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI
- [x] **SOP-04**: Koordinator Tim Penyusun dapat mengajukan evaluasi (SIAP_DIEVALUASI → DIAJUKAN_EVALUASI) untuk DetailSOP milik OPD-nya
- [x] **SOP-05**: Sistem mengubah status DetailSOP menjadi SEDANG_DIEVALUASI saat masuk PengajuanEvaluasi aktif
- [x] **SOP-06**: Tim Evaluasi dapat mengirim hasil evaluasi: jika SESUAI → SIAP_DIVERIFIKASI; jika TIDAK_SESUAI → REVISI_DARI_TIM_EVALUASI
- [x] **SOP-07**: Setelah Biro Organisasi TTD Berita Acara, semua DetailSOP dalam pengajuan tersebut otomatis berstatus DIVERIFIKASI_BIRO_ORGANISASI
- [x] **SOP-08**: Setelah Koordinator Tim Penyusun TTD Berita Acara, Kepala OPD dapat mengesahkan masing-masing DetailSOP (DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU)
- [x] **SOP-09**: Kepala OPD dapat melihat semua DetailSOP milik OPD-nya
- [x] **SOP-10**: Biro Organisasi dapat melihat semua DetailSOP dari semua OPD
- [x] **SOP-11**: Tim Evaluasi dapat melihat DetailSOP yang masuk ke tahap evaluasi (status DIAJUKAN_EVALUASI / SEDANG_DIEVALUASI)
- [x] **SOP-12**: DetailSOP dapat di-filter berdasarkan status, OPD, tanggal
- [x] **SOP-13**: Constraint hanya 1 DetailSOP dengan status BERLAKU per SOP — enforce via trigger + service layer
- [x] **SOP-14**: Constraint transisi status valid: DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU → DICABUT/DIGANTIKAN
- [x] **SOP-15**: BERLAKU dan DICABUT adalah status terminal — tidak bisa diubah kecuali BERLAKU → DICABUT
- [x] **SOP-16**: SOP tidak bisa dihapus kalau semua DetailSOP sudah ada relasi RiwayatTandaTangan atau NilaiEvaluasi (Restrict)
- [x] **SOP-17**: 1 SOP bisa punya banyak DetailSOP (versi dokumen), Cascade delete

---

### SOP — Metadata & Detail

- [x] **SOP-18**: Tim Penyusun dapat menyimpan metadata lengkap DetailSOP (institution, PIC, section, warning, equipment, institutionLines)
- [x] **SOP-19**: Tim Penyusun dapat mengelola dasar hukum (law basis) DetailSOP via tabel junction DasarHukum (M:N ke Peraturan)
- [x] **SOP-20**: Tim Penyusun dapat mengelola SOP terkait (SopTerkait) via tabel junction self-referential M:N
- [x] **SOP-21**: Constraint SopTerkait — tidak boleh relasi dengan diri sendiri, tidak boleh duplikat bidirectional (A→B jika B→A sudah ada)
- [x] **SOP-22**: Response detail DetailSOP menyertakan metadata, law basis, prosedur (LangkahSOP), dan SOP terkait
- [x] **SOP-23**: Constraint DasarHukum — Peraturan hanya boleh dipakai untuk SOP dari OPD yang sama
- [x] **SOP-24**: 1 DetailSOP bisa punya banyak LampiranTeks dengan jenis discriminator (PERINGATAN/KUALIFIKASI_PELAKSANAAN/PERALATAN/PENCATATAN_PENDATAAN)

---

### Pelaksana & Prosedur

- [x] **PLK-01**: Tim Penyusun dapat mengelola master data pelaksana SOP per OPD (CRUD Pelaksana)
- [x] **PLK-02**: Tim Penyusun dapat membuat, mengupdate, dan menghapus prosedur steps (LangkahSOP)
- [x] **PLK-03**: Constraint setiap LangkahSOP (termasuk START/END) harus punya pelaksana yang terdaftar di DetailSOPPelaksana (swimlane)
- [x] **PLK-04**: Prosedur step dengan type DECISION memiliki langkahSelanjutnyaYaId dan langkahSelanjutnyaTidakId (flowchart branching)
- [x] **PLK-05**: Urutan prosedur steps dapat diubah (unique [sopDetailId, urutan])
- [x] **PLK-06**: Constraint jenis langkah: TERMINATOR (kedua next NULL), TASK (hanya yaId boleh diisi), DECISION (keduanya boleh diisi)
- [x] **PLK-07**: Service layer wajib hapus DiagramEdge + DiagramNodePosition sebelum hapus LangkahSOP (avoid multi-path cascade)
- [x] **PLK-08**: 1 DetailSOP punya banyak DetailSOPPelaksana (swimlane) untuk daftar pelaksana di diagram dengan field urutan

---

### Tim Penyusun & Tim Evaluasi

- [x] **TIM-01**: Biro Organisasi dapat menambah AnggotaTimPenyusun ke OPD tertentu dengan role internal (Koordinator/Anggota)
- [x] **TIM-02**: Biro Organisasi dapat menonaktifkan AnggotaTimPenyusun (status → NONAKTIF, simpan berakhirPada)
- [x] **TIM-03**: Biro Organisasi dapat memindah AnggotaTimPenyusun ke OPD lain
- [x] **TIM-04**: Biro Organisasi dapat mengelola AnggotaTimEvaluasi (tambah, nonaktifkan) — global, tidak terikat OPD
- [x] **TIM-05**: Daftar AnggotaTimPenyusun menampilkan jumlahSOPDisusun per anggota
- [x] **TIM-06**: Constraint unique [userId, opdId] — 1 pengguna hanya bisa tercatat 1 kali per OPD
- [x] **TIM-07**: Constraint unique userId pada AnggotaTimEvaluasi — 1 pengguna hanya bisa jadi 1 anggota tim evaluasi
- [x] **TIM-08**: Invariant (status = AKTIF) ↔ (berakhirPada IS NULL) — selalu update keduanya bersamaan
- [x] **TIM-09**: Pengguna tidak bisa dihapus kalau masih tercatat di AnggotaTimPenyusun atau AnggotaTimEvaluasi (Restrict)

---

### Evaluasi & Verifikasi (PengajuanEvaluasi)

- [x] **EVL-01**: Biro Organisasi dapat membuat PengajuanEvaluasi untuk DetailSOP dari satu atau lebih OPD (jenis: TERJADWAL / MANDIRI)
- [x] **EVL-02**: Constraint maks 1 pengajuan aktif per OPD per jenis — enforce via SELECT FOR UPDATE + tabel sentinel KunciPengajuanEvaluasi
- [x] **EVL-03**: Sistem mengubah status DetailSOP menjadi SEDANG_DIEVALUASI saat masuk pengajuan aktif
- [x] **EVL-04**: Tim Evaluasi dapat melihat daftar pengajuan evaluasi (evaluator open pool — semua evaluator bisa lihat semua SOP OPD)
- [x] **EVL-05**: Tim Evaluasi dapat mengisi hasil evaluasi per DetailSOP (SESUAI / TIDAK_SESUAI) dengan catatan opsional
- [x] **EVL-06**: Tim Evaluasi dapat mengirim hasil evaluasi pengajuan (status → SELESAI_DIEVALUASI)
- [x] **EVL-07**: Constraint TERJADWAL wajib isi nilaiOPD saat SELESAI; MANDIRI harus NULL nilaiOPD
- [x] **EVL-08**: Response evaluasi menyertakan daftar DetailSOP beserta hasil evaluasi masing-masing
- [x] **EVL-09**: Biro Organisasi dapat melihat grafik/rekap evaluasi tahunan per OPD
- [x] **EVL-10**: Optimistic locking pada NilaiEvaluasi via field version — prevent lost update
- [x] **EVL-11**: LogNilaiEvaluasi mencatat audit trail immutable setiap perubahan nilai (hasilSebelum, hasilSesudah, catatanSebelum, catatanSesudah)
- [x] **EVL-12**: Constraint unique [pengajuanEvaluasiId, sopDetailId] — 1 SOP hanya punya 1 nilai per pengajuan
- [x] **EVL-13**: Constraint scope — DetailSOP harus dari OPD yang sama dengan PengajuanEvaluasi

---

### TTE (Tanda Tangan Elektronik) & Berita Acara

Urutan penandatanganan wajib diikuti: **Biro TTD BA → Koordinator TTD BA → Kepala OPD TTD per SOP**

- [x] **TTE-01**: User dapat mendaftarkan KredensialTTE (nip, jabatan, pangkat, PIN) — 1:1 dengan Pengguna
- [x] **TTE-02**: User dapat memverifikasi email TTE sebelum dapat menandatangani dokumen
- [x] **TTE-03**: Constraint peran TTE harus kompatibel dengan Pengguna.peran (KEPALA_OPD, BIRO_ORGANISASI, KOORDINATOR_TIM_PENYUSUN saja)
- [x] **TTE-04**: TIM_EVALUASI dan TIM_PENYUSUN tidak boleh memiliki KredensialTTE
- [x] **TTE-05**: Biro Organisasi dapat menandatangani Berita Acara evaluasi menggunakan PIN TTE; setelah TTD, status pengajuan → DIVERIFIKASI_BIRO, semua SOP → DIVERIFIKASI_BIRO_ORGANISASI
- [x] **TTE-06**: Koordinator Tim Penyusun dapat menandatangani Berita Acara milik OPD-nya (hanya setelah Biro sudah TTD BA tersebut); status pengajuan → DITANDATANGANI_KOORDINATOR
- [x] **TTE-07**: Setelah Koordinator TTD BA, Kepala OPD dapat mengesahkan masing-masing SOP dalam pengajuan (TTD per dokumen DetailSOP); SOP yang disahkan berstatus BERLAKU
- [x] **TTE-08**: Constraint XOR RiwayatTandaTangan — tepat satu dari sopDetailId atau pengajuanEvaluasiId harus diisi
- [x] **TTE-09**: Constraint 1 SOP = maksimal 1 TTE di RiwayatTandaTangan (hanya KEPALA_OPD)
- [x] **TTE-10**: Constraint 1 PengajuanEvaluasi bisa punya 2 RiwayatTandaTangan (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI untuk BA)
- [x] **TTE-11**: Constraint BA hanya bisa ditandatangani setelah: Status = DIVERIFIKASI_BIRO, semua NilaiEvaluasi sudah diisi, belum pernah TTE
- [x] **TTE-12**: Setiap penandatanganan tersimpan sebagai RiwayatTandaTangan dengan document hash dan timestamp
- [x] **TTE-13**: User dapat melihat riwayat audit TTE yang dilakukannya

---

### Audit Log SOP (LogEditSOP)

- [x] **AUD-01**: Setiap perubahan DetailSOP otomatis mencatat LogEditSOP (actor, bagian, entityId, keterangan, createdAt)
- [x] **AUD-02**: Bagian yang dicatat: METADATA, LANGKAH_SOP, LAMPIRAN_TEKS, DASAR_HUKUM, PELAKSANA, DIAGRAM, SOP_TERKAIT
- [x] **AUD-03**: User dapat melihat riwayat perubahan DetailSOP tertentu (kolaborasi Tim Penyusun)
- [x] **AUD-04**: Biro Organisasi dapat melihat LogEditSOP semua DetailSOP
- [x] **AUD-05**: LogEditSOP immutable — tidak ada updatedAt, hanya createdAt; setiap aksi = baris baru
- [x] **AUD-06**: Komentar tidak masuk LogEditSOP — Komentar tabel adalah audit trail-nya sendiri (userId + createdAt + isi)

---

## v2.0 Requirements (Deferred)

### Notifikasi
- **NOTF-01**: User menerima notifikasi in-app SSE saat SOP berubah status atau ada tugas evaluasi baru

### Laporan & Ekspor
- **RPT-01**: Export SOP ke PDF format baku (dengan diagram flowchart/BPMN)
- **RPT-02**: Export daftar SOP ke Excel
- **RPT-03**: Export Berita Acara format PDF
- **RPT-04**: Export rekap evaluasi tahunan per OPD ke Excel

### Pencabutan SOP
- **CBL-01**: Kepala OPD atau Biro Organisasi dapat mencabut SOP berstatus BERLAKU → DICABUT dengan catatan alasan

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat/komentar | Belum dibutuhkan, tambah kompleksitas |
| Mobile app | Web-first, mobile phase berikutnya |
| Multi-tenant (multi-kota) | v1.0 fokus satu instansi pemerintah |
| Versioning SOP (branching) | Terlalu kompleks untuk v1, cukup versi integer |
| Workflow approval multi-step custom | Alur sudah fix sesuai regulasi |
| Reset PIN TTE | Deferred ke v2.0 |
| Preview BA sebelum TTD | Deferred ke v2.0 |
| SLA/deadline evaluasi | Deferred ke v2.0 |

---

## Traceability Matrix

| Requirement | ERD Reference | PRD Use Case | Phase | Status |
|-------------|---------------|--------------|-------|--------|
| DB-01 | Semua entitas | — | Phase 1 | ✅ Implemented |
| DB-02 | Semua relasi | — | Phase 1 | ✅ Implemented |
| DB-03 | Semua enum | — | Phase 1 | ✅ Implemented |
| DB-04 | — | — | Phase 1 | ✅ Implemented |
| AUTH-01 | Pengguna | — | Phase 2 | ✅ Implemented |
| AUTH-07 | Pengguna [P2-D] | — | Phase 2 | ✅ Implemented |
| AUTH-08 | Pengguna [P2-D] | — | Phase 2 | ✅ Implemented |
| OPD-01 | OPD | UC-08 | Phase 3 | ✅ Implemented |
| OPD-04 | OPD [P1-G] | UC-08 | Phase 3 | ✅ Implemented |
| PRT-06 | Peraturan [P2-H] | UC-12 | Phase 3 | ✅ Implemented |
| PRT-07 | Peraturan [P2-F] | UC-12 | Phase 3 | ✅ Implemented |
| SOP-13 | DetailSOP [P0-B] | UC-01 | Phase 5 | ✅ Implemented |
| SOP-14 | DetailSOP [P0-D] | UC-01, UC-03 | Phase 5 | ✅ Implemented |
| PLK-03 | LangkahSOP [P1-C] | UC-03 | Phase 5 | ✅ Implemented |
| PLK-07 | LangkahSOP [P0-A] | UC-03 | Phase 5 | ✅ Implemented |
| TIM-06 | AnggotaTimPenyusun | UC-09 | Phase 4 | ✅ Implemented |
| TIM-08 | AnggotaTimPenyusun [P1-F] | UC-09 | Phase 4 | ✅ Implemented |
| EVL-02 | PengajuanEvaluasi [P0-C] | UC-10 | Phase 6 | ✅ Implemented |
| EVL-07 | PengajuanEvaluasi [P1-B] | UC-10 | Phase 6 | ✅ Implemented |
| EVL-10 | NilaiEvaluasi [P0-E] | UC-05 | Phase 6 | ✅ Implemented |
| TTE-03 | KredensialTTE [P1-D] | UC-13 | Phase 7 | ✅ Implemented |
| TTE-08 | RiwayatTandaTangan [P1-A] | UC-06 | Phase 7 | ✅ Implemented |
| TTE-11 | RiwayatTandaTangan | UC-06 | Phase 7 | ✅ Implemented |

**Coverage:**
- v1.0 requirements: 89 total (DB: 5, AUTH: 8, OPD: 7, PRT: 9, SOP: 17, Metadata: 7, PLK: 8, TIM: 9, EVL: 13, TTE: 13, AUD: 6)
- Mapped to phases: 89
- Unmapped: 0
- **Implemented: 89/89 (100%)** ✅

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
*Backend implementation status: 2026-04-01 — All 89 requirements implemented*
