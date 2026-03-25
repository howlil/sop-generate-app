# Requirements: Sistem Informasi SOP Biro Organisasi

**Defined:** 2026-03-15
**Core Value:** Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

---

## v1.0 Requirements — Backend Implementation

Sumber: UI prototype client sudah lengkap. Backend dibangun untuk merealisasikan alur kerja yang sudah ada di client.

---

### Database & Infrastruktur

- [x] **DB-01**: Skema Prisma mengimplementasikan seluruh 18 tabel ERD yang disetujui
- [x] **DB-02**: Semua relasi antar tabel (FK, constraints) terdefinisi dengan benar di schema
- [x] **DB-03**: Enum Prisma untuk semua status field (StatusSOP, AuditAction, TTERole, dll)
- [ ] **DB-04**: Migration Prisma dapat dijalankan clean pada database MariaDB kosong

---

### Auth & Users

- [ ] **AUTH-01**: User dapat login dengan email dan password, mendapat JWT access token
- [ ] **AUTH-02**: JWT token mengandung userId, role, dan opdId (untuk filtering data per OPD)
- [ ] **AUTH-03**: Setiap endpoint terproteksi oleh JWT guard (kecuali `/auth/login` dan `/health`)
- [ ] **AUTH-04**: Guard role memastikan endpoint hanya dapat diakses role yang sesuai
- [ ] **AUTH-05**: Admin Biro Organisasi dapat membuat akun user baru dengan role tertentu dan password default
- [ ] **AUTH-06**: User dapat mengubah password sendiri

---

### OPD

- [ ] **OPD-01**: Biro Organisasi dapat melihat daftar semua OPD
- [ ] **OPD-02**: Biro Organisasi dapat membuat OPD baru
- [ ] **OPD-03**: Biro Organisasi dapat mengupdate data OPD
- [ ] **OPD-04**: Kepala OPD dan Tim Penyusun hanya dapat melihat data OPD miliknya
- [ ] **OPD-05**: Response OPD menyertakan agregat: totalSOP, sopBerlaku, sopDraft

---

### Peraturan

- [ ] **PRT-01**: User dapat melihat daftar peraturan yang berlaku
- [ ] **PRT-02**: Biro Organisasi dapat membuat peraturan baru
- [ ] **PRT-03**: Biro Organisasi dapat mengupdate peraturan (otomatis increment version)
- [ ] **PRT-04**: Biro Organisasi dapat mencabut peraturan (status → DICABUT)
- [ ] **PRT-05**: Response peraturan menyertakan jumlah SOP yang menggunakannya (`digunakan`)

---

### SOP — Core

- [ ] **SOP-01**: Tim Penyusun dapat membuat SOP baru (status awal: DRAFT)
- [ ] **SOP-02**: Tim Penyusun dapat mengupdate metadata dan konten SOP selama status DRAFT atau SEDANG_DISUSUN; juga bisa edit ulang jika status REVISI_DARI_TIM_EVALUASI
- [ ] **SOP-03**: Tim Penyusun (tombol Selesai) dapat mengubah status SOP dari SEDANG_DISUSUN → SIAP_DIEVALUASI
- [ ] **SOP-04**: Koordinator Tim Penyusun dapat mengajukan evaluasi (SIAP_DIEVALUASI → DIAJUKAN_EVALUASI) untuk SOP milik OPD-nya
- [ ] **SOP-05**: Tim Evaluasi dapat memulai evaluasi (DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI)
- [ ] **SOP-06**: Tim Evaluasi dapat mengirim hasil evaluasi: jika Sesuai → SIAP_DIVERIFIKASI; jika Revisi Biro → REVISI_DARI_TIM_EVALUASI
- [ ] **SOP-07**: Setelah Biro Organisasi TTD Berita Acara, semua SOP dalam batch tersebut otomatis berstatus DIVERIFIKASI_BIRO_ORGANISASI
- [ ] **SOP-08**: Setelah Koordinator Tim Penyusun TTD Berita Acara, Kepala OPD dapat mengesahkan masing-masing SOP (DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU)
- [ ] **SOP-09**: Kepala OPD dapat melihat semua SOP milik OPD-nya
- [ ] **SOP-10**: Biro Organisasi dapat melihat semua SOP dari semua OPD
- [ ] **SOP-11**: Tim Evaluasi dapat melihat SOP yang masuk ke tahap evaluasi (status DIAJUKAN_EVALUASI / SEDANG_DIEVALUASI)
- [ ] **SOP-12**: SOP dapat di-filter berdasarkan status, OPD
- [ ] **SOP-13**: SOP memiliki nomor otomatis (format: `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]`)

---

### SOP — Metadata & Detail

- [ ] **SOP-14**: Tim Penyusun dapat menyimpan metadata lengkap SOP (institution, PIC, section, warning, dll)
- [ ] **SOP-15**: Tim Penyusun dapat mengelola dasar hukum (law basis) SOP
- [ ] **SOP-16**: Tim Penyusun dapat mengelola SOP terkait (relatedSop)
- [ ] **SOP-17**: Response detail SOP menyertakan metadata, law basis, prosedur, dan SOP terkait

---

### Pelaksana & Prosedur

- [ ] **PLK-01**: Tim Penyusun dapat mengelola master data pelaksana SOP per OPD (CRUD)
- [ ] **PLK-02**: Tim Penyusun dapat membuat, mengupdate, dan menghapus prosedur steps (prosedur_row)
- [ ] **PLK-03**: Prosedur step dapat ditugaskan ke satu atau lebih pelaksana
- [ ] **PLK-04**: Prosedur step dengan type DECISION memiliki next_step_yes dan next_step_no (flowchart branching)
- [ ] **PLK-05**: Urutan prosedur steps dapat diubah

---

### Tim Penyusun & Tim Evaluasi

- [ ] **TIM-01**: Biro Organisasi dapat menambah anggota Tim Penyusun ke OPD tertentu
- [ ] **TIM-02**: Biro Organisasi dapat menonaktifkan anggota Tim Penyusun (status → NONAKTIF, simpan endedAt)
- [ ] **TIM-03**: Biro Organisasi dapat memindah anggota Tim Penyusun ke OPD lain
- [ ] **TIM-04**: Biro Organisasi dapat mengelola anggota Tim Evaluasi (tambah, nonaktifkan)
- [ ] **TIM-05**: Daftar anggota Tim Penyusun menampilkan jumlahSOPDisusun per anggota

---

### Evaluasi & Verifikasi

- [ ] **EVL-01**: Biro Organisasi dapat membuat batch evaluasi (VerifikasiBatch) untuk SOP dari OPD
- [ ] **EVL-02**: Biro Organisasi dapat menugaskan anggota Tim Evaluasi ke batch evaluasi (status batch → SUDAH_DITUGASKAN; SOP → SEDANG_DIEVALUASI)
- [ ] **EVL-03**: Tim Evaluasi dapat melihat daftar batch evaluasi yang ditugaskan kepadanya
- [ ] **EVL-04**: Tim Evaluasi dapat mengisi hasil evaluasi per SOP (SESUAI / REVISI_BIRO)
- [ ] **EVL-05**: Tim Evaluasi dapat mengirim hasil evaluasi batch (status batch → SELESAI); SOP Sesuai → SIAP_DIVERIFIKASI, SOP Revisi Biro → REVISI_DARI_TIM_EVALUASI
- [ ] **EVL-06**: Biro Organisasi dapat melihat batch yang sudah selesai dan siap diverifikasi
- [ ] **EVL-07**: Response evaluasi menyertakan daftar SOP beserta hasil evaluasi masing-masing
- [ ] **EVL-08**: Biro Organisasi dapat melihat grafik/rekap evaluasi tahunan per OPD

---

### TTE (Tanda Tangan Elektronik) & Berita Acara

Urutan penandatanganan wajib diikuti: **Biro TTD BA → Koordinator Tim Penyusun TTD BA → Kepala OPD TTD per SOP**

- [ ] **TTE-01**: User dapat mendaftarkan profil TTE (nip, jabatan, pangkat, PIN)
- [ ] **TTE-02**: User dapat memverifikasi email TTE sebelum dapat menandatangani dokumen
- [ ] **TTE-03**: Biro Organisasi dapat menandatangani Berita Acara evaluasi menggunakan PIN TTE; setelah TTD, semua SOP dalam batch otomatis berstatus DIVERIFIKASI_BIRO_ORGANISASI
- [ ] **TTE-04**: Koordinator Tim Penyusun dapat menandatangani Berita Acara milik OPD-nya (hanya setelah Biro sudah TTD BA tersebut); satu BA = satu OPD
- [ ] **TTE-05**: Setelah Koordinator TTD BA, Kepala OPD dapat mengesahkan masing-masing SOP dalam batch (TTD per dokumen SOP); SOP yang disahkan berstatus BERLAKU
- [ ] **TTE-06**: Penandatanganan Kepala OPD dilakukan per batch — dari detail batch akan muncul list SOP yang bisa ditandatangani
- [ ] **TTE-07**: Setiap penandatanganan tersimpan sebagai TTESignature dengan document hash
- [ ] **TTE-08**: User dapat melihat riwayat audit TTE yang dilakukannya

---

### Audit Log SOP

- [ ] **AUD-01**: Setiap perubahan status SOP otomatis mencatat audit log (actor, action, status sebelum/sesudah)
- [ ] **AUD-02**: User dapat melihat riwayat status SOP tertentu
- [ ] **AUD-03**: Biro Organisasi dapat melihat audit log semua SOP

---

## v2.0 Requirements (Deferred)

### Notifikasi
- **NOTF-01**: User menerima notifikasi in-app SSE

### Laporan & Ekspor
- **RPT-01**: Export SOP ke PDF format baku
- **RPT-02**: Export daftar SOP ke Excel
- **RPT-03**: Export Berita Acara format PDF

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat/komentar | Belum dibutuhkan, tambah kompleksitas |
| Mobile app | Web-first, mobile phase berikutnya |
| Multi-tenant (multi-kota) | v1.0 fokus satu instansi pemerintah |
| Versioning SOP (branching) | Terlalu kompleks untuk v1, cukup versi integer |
| Workflow approval multi-step custom | Alur sudah fix sesuai regulasi |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1: Database & Infrastructure | Complete |
| DB-02 | Phase 1: Database & Infrastructure | Complete |
| DB-03 | Phase 1: Database & Infrastructure | Complete |
| DB-04 | Phase 1: Database & Infrastructure | Pending |
| AUTH-01 | Phase 2: Auth & Users | Pending |
| AUTH-02 | Phase 2: Auth & Users | Pending |
| AUTH-03 | Phase 2: Auth & Users | Pending |
| AUTH-04 | Phase 2: Auth & Users | Pending |
| AUTH-05 | Phase 2: Auth & Users | Pending |
| AUTH-06 | Phase 2: Auth & Users | Pending |
| OPD-01 | Phase 3: OPD & Peraturan | Pending |
| OPD-02 | Phase 3: OPD & Peraturan | Pending |
| OPD-03 | Phase 3: OPD & Peraturan | Pending |
| OPD-04 | Phase 3: OPD & Peraturan | Pending |
| OPD-05 | Phase 3: OPD & Peraturan | Pending |
| PRT-01 | Phase 3: OPD & Peraturan | Pending |
| PRT-02 | Phase 3: OPD & Peraturan | Pending |
| PRT-03 | Phase 3: OPD & Peraturan | Pending |
| PRT-04 | Phase 3: OPD & Peraturan | Pending |
| PRT-05 | Phase 3: OPD & Peraturan | Pending |
| TIM-01 | Phase 4: Tim Penyusun & Tim Evaluasi | Pending |
| TIM-02 | Phase 4: Tim Penyusun & Tim Evaluasi | Pending |
| TIM-03 | Phase 4: Tim Penyusun & Tim Evaluasi | Pending |
| TIM-04 | Phase 4: Tim Penyusun & Tim Evaluasi | Pending |
| TIM-05 | Phase 4: Tim Penyusun & Tim Evaluasi | Pending |
| SOP-01 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-02 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-03 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-04 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-05 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-06 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-07 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-08 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-09 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-10 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-11 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-12 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-13 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-14 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-15 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-16 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| SOP-17 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| PLK-01 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| PLK-02 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| PLK-03 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| PLK-04 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| PLK-05 | Phase 5: SOP Core, Metadata & Pelaksana | Pending |
| EVL-01 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-02 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-03 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-04 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-05 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-06 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-07 | Phase 6: Evaluasi & Verifikasi | Pending |
| EVL-08 | Phase 6: Evaluasi & Verifikasi | Pending |
| TTE-01 | Phase 7: TTE & Berita Acara | Pending |
| TTE-02 | Phase 7: TTE & Berita Acara | Pending |
| TTE-03 | Phase 7: TTE & Berita Acara | Pending |
| TTE-04 | Phase 7: TTE & Berita Acara | Pending |
| TTE-05 | Phase 7: TTE & Berita Acara | Pending |
| TTE-06 | Phase 7: TTE & Berita Acara | Pending |
| TTE-07 | Phase 7: TTE & Berita Acara | Pending |
| TTE-08 | Phase 7: TTE & Berita Acara | Pending |
| AUD-01 | Phase 8: Audit Log | Pending |
| AUD-02 | Phase 8: Audit Log | Pending |
| AUD-03 | Phase 8: Audit Log | Pending |

**Coverage:**
- v1.0 requirements: 66 total
- Mapped to phases: 66
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-25 -- traceability expanded to individual requirements with phase mappings*
