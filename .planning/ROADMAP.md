# Roadmap: Sistem Informasi SOP Biro Organisasi

**Milestone:** v1.0 Backend Implementation
**Phases:** 8
**Granularity:** Standard
**Total Requirements:** 89
**Coverage:** 89/89 mapped
**Last Updated:** 2026-04-01 (aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3)

---

## Single Source of Truth

Dokumen referensi yang wajib dirujuk:
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi (legenda delete behavior, constraint FK)
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma (optimistic locking, unique constraint, invariant)
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements fungsional/non-fungsional

---

## Phases

- [x] **Phase 1: Database & Infrastructure** - Prisma schema dengan 20 model, 12+ enum, relasi, index, cascade rules, migration clean di MariaDB
- [x] **Phase 2: Auth & Users** - JWT login, role guards, akun manajemen untuk 4 role, constraint 1 KEPALA_OPD + 1 KOORDINATOR per OPD
- [x] **Phase 3: OPD & Peraturan** - CRUD endpoint untuk OPD (soft-delete) dan Peraturan (versioning, status BERLAKU/DICABUT)
- [x] **Phase 4: Tim Penyusun & Tim Evaluasi** - Manajemen keanggotaan dengan invariant AKTIF ↔ berakhirPada, role assignment, OPD binding
- [x] **Phase 5: SOP Core, Metadata & Pelaksana** - Full SOP lifecycle (DRAFT → BERLAKU → DICABUT), metadata, prosedur steps, pelaksana, swimlane
- [x] **Phase 6: Evaluasi & Verifikasi** - PengajuanEvaluasi workflow (TERJADWAL/MANDIRI), open pool evaluator, hasil evaluasi (SESUAI/TIDAK_SESUAI), optimistic locking
- [x] **Phase 7: TTE & Berita Acara** - KredensialTTE, RiwayatTandaTangan (XOR constraint), sequential TTE: Biro → Koordinator → Kepala OPD
- [x] **Phase 8: Audit Log** - LogEditSOP otomatis per perubahan SOP (bagian: METADATA/LANGKAH_SOP/LAMPIRAN_TEKS/DASAR_HUKUM/PELAKSANA/DIAGRAM/SOP_TERKAIT)

---

## Phase Details

### Phase 1: Database & Infrastructure
**Goal**: Database MariaDB berjalan dengan skema domain lengkap (20 model, 12+ enum) yang menjadi fondasi semua modul berikutnya

**Depends on**: Nothing (foundation)

**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05

**Success Criteria** (what must be TRUE):
  1. `prisma migrate dev` runs clean pada empty MariaDB instance dan membuat semua 20 tabel
  2. Semua foreign key relationships enforced — inserting SOP dengan opdId yang tidak ada fail dengan constraint error
  3. Semua enum fields (StatusSOP, HasilEvaluasi, StatusPengajuanEvaluasi, PeranTTE, BagianSOP, dll) hanya accept defined values
  4. `prisma generate` produces client yang bisa di-import dan digunakan di NestJS modules tanpa errors
  5. Delete behavior (Cascade/Restrict/SetNull) sesuai ERD — test dengan insert parent-child lalu delete parent
  6. Index strategy terpasang untuk FK dan query pattern umum (per opdId, per status, per userId)

**Plans**:
- [x] 01-01-PLAN.md — Modify schema: add ImplementQualification + Komentar models, new fields on VerifikasiBatch/EvaluasiItem/TTESignature, FK indexes, cascade rules, enum updates *(outdated — perlu rebase ke ERD terbaru)*
- [x] 01-02-PLAN.md — Baseline migration dengan 20 model ERD terbaru, triggers installed ✅ **EXECUTION COMPLETE**
- [x] Phase 1 Complete — Database ready for Phase 2

---

### Phase 2: Auth & Users
**Goal**: User dapat authenticate securely dan sistem enforce role-based access pada setiap endpoint dengan constraint 1 KEPALA_OPD + 1 KOORDINATOR per OPD

**Depends on**: Phase 1

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08

**Success Criteria** (what must be TRUE):
  1. User dapat POST `/auth/login` dengan email/password dan receive JWT containing userId, role, dan opdId
  2. Calling any protected endpoint tanpa valid JWT returns 401 Unauthorized
  3. Tim Penyusun user calling biro-organisasi-only endpoint returns 403 Forbidden
  4. Biro Organisasi dapat create new user account via API dan user baru dapat immediately log in
  5. Logged-in user dapat change their own password, dan old password no longer works
  6. Constraint 1 KEPALA_OPD aktif per OPD enforced — mencoba create KEPALA_OPD kedua di OPD sama fail dengan conflict error
  7. Constraint 1 KOORDINATOR_TIM_PENYUSUN aktif per OPD enforced — mencoba create koordinator kedua fail
  8. Service layer menggunakan SELECT FOR UPDATE untuk enforce constraint [P2-D]

**Plans**: TBD

---

### Phase 3: OPD & Peraturan
**Goal**: Reference data untuk OPD dan Peraturan manageable via API, enabling SOP creation di phases berikutnya dengan soft-delete dan versioning support

**Depends on**: Phase 2

**Requirements**: OPD-01, OPD-02, OPD-03, OPD-04, OPD-05, OPD-06, OPD-07, PRT-01, PRT-02, PRT-03, PRT-04, PRT-05, PRT-06, PRT-07, PRT-08, PRT-09

**Success Criteria** (what must be TRUE):
  1. Biro Organisasi dapat create, list, update OPD; response includes aggregates (totalSOP, sopBerlaku, sopDraft)
  2. Kepala OPD atau Tim Penyusun user hanya dapat see their own OPD data (filtered by opdId dari JWT)
  3. Biro Organisasi dapat soft-delete OPD (deletedAt) dengan validasi tidak ada pengajuan evaluasi aktif
  4. Biro Organisasi dapat create Peraturan (status BERLAKU), update (version auto-increment), revoke (status → DICABUT)
  5. Peraturan list response includes `digunakan` count showing how many DetailSOP reference each peraturan
  6. Constraint scope OPD enforced — Tim Penyusun hanya bisa lihat/perbaiki Peraturan milik OPD-nya sendiri
  7. Constraint Peraturan DICABUT tidak bisa dijadikan DasarHukum untuk SOP baru — enforce di service layer
  8. Unique constraint [opdId, nomor, tahun] enforced — duplicate fail
  9. Peraturan tidak bisa dihapus kalau masih dipakai sebagai DasarHukum (Restrict delete)

**Plans**: TBD

---

### Phase 4: Tim Penyusun & Tim Evaluasi
**Goal**: Biro Organisasi dapat manage team membership sehingga users properly assigned ke OPDs dan evaluation roles dengan invariant AKTIF ↔ berakhirPada

**Depends on**: Phase 2

**Requirements**: TIM-01, TIM-02, TIM-03, TIM-04, TIM-05, TIM-06, TIM-07, TIM-08, TIM-09

**Success Criteria** (what must be TRUE):
  1. Biro Organisasi dapat add user sebagai AnggotaTimPenyusun ke specific OPD dengan role internal (Koordinator/Anggota)
  2. Biro Organisasi dapat deactivate AnggotaTimPenyusun (status → NONAKTIF, berakhirPada recorded) dan transfer ke OPD lain
  3. Biro Organisasi dapat add dan deactivate AnggotaTimEvaluasi (global, tidak terikat OPD)
  4. AnggotaTimPenyusun list includes `jumlahSOPDisusun` per member
  5. Constraint unique [userId, opdId] enforced — 1 user hanya bisa tercatat 1 kali per OPD
  6. Constraint unique userId pada AnggotaTimEvaluasi enforced — 1 user hanya bisa jadi 1 anggota tim evaluasi
  7. Invariant (status = AKTIF) ↔ (berakhirPada IS NULL) — selalu update keduanya bersamaan
  8. User tidak bisa dihapus kalau masih tercatat di AnggotaTimPenyusun atau AnggotaTimEvaluasi (Restrict)

**Plans**: TBD

---

### Phase 5: SOP Core, Metadata & Pelaksana
**Goal**: Tim Penyusun dapat create dan fully compose DetailSOP (versi dokumen) melalui complete status workflow hingga SIAP_DIEVALUASI, dengan semua metadata, prosedur steps, dan pelaksana

**Depends on**: Phase 3, Phase 4

**Requirements**: SOP-01 s.d. SOP-24, PLK-01 s.d. PLK-08

**Success Criteria** (what must be TRUE):
  1. Tim Penyusun dapat create new SOP (status DRAFT) dengan auto-generated number format `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]`
  2. Tim Penyusun dapat edit DetailSOP metadata, law basis (DasarHukum), related SOPs (SopTerkait), dan procedure steps (LangkahSOP) while in DRAFT/SEDANG_DISUSUN/REVISI_DARI_TIM_EVALUASI status
  3. DetailSOP status transitions follow full regulated flow: DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU → DICABUT/DIGANTIKAN
  4. Constraint hanya 1 DetailSOP berstatus BERLAKU per SOP — enforce via trigger + service layer
  5. BERLAKU dan DICABUT adalah terminal — tidak bisa diubah kecuali BERLAKU → DICABUT
  6. Procedure steps support multi-pelaksana assignment (via DetailSOPPelaksana/swimlane) dan DECISION-type branching (langkahSelanjutnyaYaId/langkahSelanjutnyaTidakId), step order dapat rearrange
  7. Constraint setiap LangkahSOP (termasuk START/END) harus punya pelaksana yang terdaftar di DetailSOPPelaksana
  8. Service layer wajib hapus DiagramEdge + DiagramNodePosition sebelum hapus LangkahSOP (avoid multi-path cascade deadlock)
  9. SopTerkait constraint — tidak boleh relasi dengan diri sendiri, tidak boleh duplikat bidirectional (A→B jika B→A sudah ada)
  10. DasarHukum constraint — Peraturan hanya boleh dipakai untuk SOP dari OPD yang sama
  11. Each role sees only the SOPs they should: Tim Penyusun sees own OPD, Kepala OPD sees own OPD, Tim Evaluasi sees evaluation-stage SOPs, Biro sees all; filtering by status dan OPD works
  12. SOP tidak bisa dihapus kalau semua DetailSOP sudah ada RiwayatTandaTangan atau NilaiEvaluasi (Restrict)

**Plans**: TBD

---

### Phase 6: Evaluasi & Verifikasi (PengajuanEvaluasi)
**Goal**: PengajuanEvaluasi workflow operational — Biro creates pengajuan (TERJADWAL/MANDIRI), open pool evaluator fills results, optimistic locking prevents lost update

**Depends on**: Phase 5

**Requirements**: EVL-01 s.d. EVL-13

**Success Criteria** (what must be TRUE):
  1. Biro Organisasi dapat create PengajuanEvaluasi untuk DetailSOP dari satu atau lebih OPD (jenis: TERJADWAL / MANDIRI)
  2. Constraint maks 1 pengajuan aktif per OPD per jenis enforced via SELECT FOR UPDATE + tabel sentinel KunciPengajuanEvaluasi
  3. Sistem mengubah status DetailSOP menjadi SEDANG_DIEVALUASI saat masuk pengajuan aktif
  4. Tim Evaluasi dapat see their assigned evaluations (evaluator open pool — semua evaluator bisa lihat semua SOP OPD)
  5. Tim Evaluasi dapat fill hasil evaluasi per DetailSOP (SESUAI / TIDAK_SESUAI) dengan catatan opsional
  6. Tim Evaluasi dapat submit evaluation results (status pengajuan → SELESAI_DIEVALUASI)
  7. Constraint TERJADWAL wajib isi nilaiOPD saat SELESAI; MANDIRI harus NULL nilaiOPD
  8. Response evaluasi includes daftar DetailSOP beserta hasil evaluasi masing-masing
  9. Biro Organisasi dapat view annual evaluation summary/recap per OPD
  10. Optimistic locking pada NilaiEvaluasi via field version enforced — concurrent update fail dengan version mismatch error
  11. LogNilaiEvaluasi mencatat immutable audit trail setiap perubahan nilai (hasilSebelum, hasilSesudah, catatanSebelum, catatanSesudah)
  12. Constraint unique [pengajuanEvaluasiId, sopDetailId] enforced — 1 SOP hanya punya 1 nilai per pengajuan
  13. Constraint scope — DetailSOP harus dari OPD yang sama dengan PengajuanEvaluasi

**Plans**: TBD

---

### Phase 7: TTE & Berita Acara
**Goal**: Sequential TTE workflow — **verifikasi** Berita Acara (Biro Organisasi, lalu Koordinator Tim Penyusun), kemudian **pengesahan** SOP oleh Kepala OPD (menjadi BERLAKU) dengan XOR constraint RiwayatTandaTangan

**Depends on**: Phase 6

**Requirements**: TTE-01 s.d. TTE-13

**Success Criteria** (what must be TRUE):
  1. User dapat register KredensialTTE (NIP, jabatan, pangkat, PIN) — 1:1 dengan Pengguna
  2. User dapat verify email TTE sebelum signing
  3. Constraint peran TTE harus kompatibel dengan Pengguna.peran (KEPALA_OPD, BIRO_ORGANISASI, KOORDINATOR_TIM_PENYUSUN saja) — TIM_EVALUASI dan TIM_PENYUSUN tidak boleh punya KredensialTTE
  4. Biro Organisasi dapat **verifikasi** Berita Acara (TTE) sebagai langkah pertama; status pengajuan → DIVERIFIKASI_BIRO, semua SOP → DIVERIFIKASI_BIRO_ORGANISASI
  5. Koordinator Tim Penyusun dapat complete **verifikasi** BA hanya setelah Biro TTD; status pengajuan → DITANDATANGANI_KOORDINATOR
  6. Setelah Koordinator TTD BA, Kepala OPD dapat **mengesahkan** masing-masing SOP (TTD per DetailSOP); SOP → BERLAKU
  7. Constraint XOR RiwayatTandaTangan enforced — tepat satu dari sopDetailId atau pengajuanEvaluasiId harus diisi (tidak boleh keduanya, tidak boleh kosong)
  8. Constraint 1 SOP = maksimal 1 TTE di RiwayatTandaTangan (hanya KEPALA_OPD) enforced
  9. Constraint 1 PengajuanEvaluasi bisa punya 2 RiwayatTandaTangan (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI untuk BA) enforced
  10. Constraint BA hanya bisa ditandatangani setelah: Status = DIVERIFIKASI_BIRO, semua NilaiEvaluasi sudah diisi, belum pernah TTE — enforce di service layer
  11. Setiap signature persisted sebagai RiwayatTandaTangan dengan document hash dan timestamp ISO 8601
  12. User dapat view their own TTE signing history (audit trail)

**Plans**: TBD

---

### Phase 8: Audit Log (LogEditSOP)
**Goal**: Setiap perubahan DetailSOP automatically tracked via LogEditSOP dengan bagian discriminator (METADATA/LANGKAH_SOP/LAMPIRAN_TEKS/DASAR_HUKUM/PELAKSANA/DIAGRAM/SOP_TERKAIT) dan queryable untuk accountability

**Depends on**: Phase 5 (SOP status transitions harus exist)

**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06

**Success Criteria** (what must be TRUE):
  1. Ketika DetailSOP berubah status atau konten, LogEditSOP entry otomatis created dengan actor, bagian, entityId, keterangan, createdAt
  2. Bagian yang tercatat: METADATA, LANGKAH_SOP, LAMPIRAN_TEKS, DASAR_HUKUM, PELAKSANA, DIAGRAM, SOP_TERKAIT
  3. Any user dapat view complete status history dan kolaborasi Tim Penyusun dari DetailSOP tertentu
  4. Biro Organisasi dapat query LogEditSOP across all DetailSOP (dengan filtering)
  5. LogEditSOP immutable — tidak ada updatedAt, hanya createdAt; setiap aksi = baris baru
  6. Komentar tidak masuk LogEditSOP — Komentar tabel adalah audit trail-nya sendiri (userId + createdAt + isi)

**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Requirements | Status | Completed |
|-------|----------------|--------------|--------|-----------|
| 1. Database & Infrastructure | 2/2 | DB-01 s.d. DB-05 (5) | ✅ Complete | All schema, migration, triggers |
| 2. Auth & Users | Complete | AUTH-01 s.d. AUTH-08 (8) | ✅ Complete | JWT, guards, constraints |
| 3. OPD & Peraturan | Complete | OPD-01 s.d. OPD-07 (7), PRT-01 s.d. PRT-09 (9) | ✅ Complete | CRUD, soft-delete, versioning |
| 4. Tim Penyusun & Tim Evaluasi | Complete | TIM-01 s.d. TIM-09 (9) | ✅ Complete | Membership, invariant |
| 5. SOP Core, Metadata & Pelaksana | Complete | SOP-01 s.d. SOP-24 (24), PLK-01 s.d. PLK-08 (8) | ✅ Complete | Lifecycle, metadata, steps |
| 6. Evaluasi & Verifikasi | Complete | EVL-01 s.d. EVL-13 (13) | ✅ Complete | Workflow, optimistic locking |
| 7. TTE & Berita Acara | Complete | TTE-01 s.d. TTE-13 (13) | ✅ Complete | Sequential TTE, XOR constraint |
| 8. Audit Log | Complete | AUD-01 s.d. AUD-06 (6) | ✅ Complete | Auto-logging, immutable |

**Total Requirements:** 89
**Phase Progress:** [========] 8/8 phases complete
**Requirements Done:** 89/89 (100%)

---

## Constraint References

Dokumen ini merujuk constraint berikut dari `docs/SCHEMA-CONSTRAINTS.md`:

| Code | Description | Phase |
|------|-------------|-------|
| [P0-A] | Service layer wajib hapus DiagramEdge + DiagramNodePosition sebelum DetailSOP di-delete | Phase 5 |
| [P0-B] | Hanya boleh ada 1 DetailSOP berstatus BERLAKU per SOP (trigger + service layer) | Phase 5 |
| [P0-C] | Maks 1 pengajuan aktif per OPD per jenis (SELECT FOR UPDATE + KunciPengajuanEvaluasi) | Phase 6 |
| [P0-D] | Status transisi valid: BERLAKU dan DICABUT adalah terminal | Phase 5 |
| [P0-E] | Optimistic locking pada NilaiEvaluasi via field version | Phase 6 |
| [P1-A] | XOR constraint: RiwayatTandaTangan harus tepat satu dari sopDetailId atau pengajuanEvaluasiId | Phase 7 |
| [P1-B] | TERJADWAL wajib isi nilaiOPD saat SELESAI; MANDIRI harus NULL | Phase 6 |
| [P1-C] | Pelaksana wajib terdaftar di DetailSOPPelaksana (swimlane) | Phase 5 |
| [P1-D] | Peran TTE harus kompatibel dengan Pengguna.peran | Phase 7 |
| [P1-E] | Scope constraint: DetailSOP harus dari OPD yang sama dengan PengajuanEvaluasi | Phase 6 |
| [P1-F] | Invariant: (status = AKTIF) ↔ (berakhirPada IS NULL) untuk keanggotaan tim | Phase 4 |
| [P1-G] | Soft-delete OPD/Pengguna: pastikan tidak ada pengajuan evaluasi aktif | Phase 3, 4 |
| [P2-A] | Jenis langkah: TERMINATOR/TASK/DECISION dengan aturan cabang | Phase 5 |
| [P2-B] | (reserved) | - |
| [P2-C] | Field temporal PengajuanEvaluasi hanya diisi pada status yang sesuai | Phase 6 |
| [P2-D] | 1 KEPALA_OPD + 1 KOORDINATOR_TIM_PENYUSUN per OPD (SELECT FOR UPDATE) | Phase 2 |
| [P2-E] | SopTerkait: tidak boleh relasi dengan diri sendiri, tidak boleh duplikat bidirectional | Phase 5 |
| [P2-F] | Peraturan DICABUT tidak boleh dijadikan DasarHukum; scope OPD yang sama | Phase 3, 5 |
| [P2-H] | Scope akses Peraturan: Tim Penyusun hanya bisa lihat Peraturan OPD-nya | Phase 3 |
| [P3-A] | Self-referential FK LangkahSOP dapat menciptakan siklus — deteksi di service layer | Phase 5 |
| [P3-B] | Salin DetailSOP: service layer wajib hasilkan nomorSOP baru | Phase 5 |

---
*Roadmap created: 2026-03-25*
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
*Backend implementation status: 2026-04-01 — All 8 phases complete, 89/89 requirements implemented*
