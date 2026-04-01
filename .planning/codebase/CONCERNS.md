# Architecture Concerns

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/` directory — Skill guidance untuk analysis

## Skills Reference

Architecture analysis menggunakan skill dari `.skills/`:

| Analysis Type | Skill | File |
|--------------|-------|------|
| System Architecture Review | System Architect | `.skills/system-arch.md` |
| Database Audit | Database Engineer | `.skills/database.md` |
| Fullstack Audit | Fullstack Auditor | `.skills/fullstack-audit.md` |
| DB-Specific Audit | DB Auditor | `.skills/db-audit.md` |

**Usage:**
- Untuk system diagram → gunakan `.skills/system-arch.md`
- Untuk database invariant analysis → gunakan `.skills/database.md`
- Untuk fullstack consistency check → gunakan `.skills/fullstack-audit.md`

---

## Core Concerns

### CC-01: Data Integrity dan Constraint Enforcement

**Stakeholders:** Biro Organisasi, Tim Evaluasi, Kepala OPD
**Priority:** High
**Status:** Active

**Summary:** Sistem harus enforce semua constraint dari ERD dan SCHEMA-CONSTRAINTS untuk memastikan data integrity dan konsistensi status SOP.

**Constraints:**
- [P2-D] 1 KEPALA_OPD + 1 KOORDINATOR_TIM_PENYUSUN per OPD (SELECT FOR UPDATE)
- [P0-C] Maks 1 pengajuan aktif per OPD per jenis (SELECT FOR UPDATE + tabel sentinel)
- [P0-B] Hanya 1 DetailSOP berstatus BERLAKU per SOP (trigger + service layer)
- [P0-E] Optimistic locking pada NilaiEvaluasi (version field)
- [P1-A] XOR constraint RiwayatTandaTangan (sopDetailId XOR pengajuanEvaluasiId)
- [P1-F] Invariant AKTIF ↔ berakhirPada NULL untuk keanggotaan tim
- [P0-D] Status transisi valid (BERLAKU dan DICABUT adalah terminal)

**Enforcement Points:**
- Service layer: Validation logic, SELECT FOR UPDATE queries
- Database: FK constraints, CHECK constraints, triggers
- API: DTO validation, conflict detection

**Risks:**
- Race condition saat create KEPALA_OPD kedua di OPD sama
- Lost update pada NilaiEvaluasi saat 2 evaluator edit bersamaan
- Status SOP invalid (misal: DRAFT → BERLAKU langsung)

**Mitigation:**
- Transaction isolation level READ COMMITTED
- Optimistic locking dengan version field check
- Status transition validation di service layer

---

### CC-02: Audit Trail dan Accountability

**Stakeholders:** Biro Organisasi, Auditor
**Priority:** High
**Status:** Active

**Summary:** Setiap perubahan SOP harus tercatat di LogEditSOP dengan bagian discriminator (METADATA/LANGKAH_SOP/LAMPIRAN_TEKS/DASAR_HUKUM/PELAKSANA/DIAGRAM/SOP_TERKAIT) untuk accountability dan compliance.

**Requirements:**
- AUD-01 s.d. AUD-06 (LogEditSOP otomatis, immutable, queryable)
- LogNilaiEvaluasi untuk audit trail perubahan nilai evaluasi
- RiwayatTandaTangan untuk TTE signatures dengan document hash

**Implementation:**
- Automatic logging di service layer setiap CRUD operation
- Immutable records (no updatedAt, hanya createdAt)
- Query API untuk riwayat perubahan per DetailSOP

**Risks:**
- LogEditSOP tidak tercatat saat error
- Performa query menurun saat log besar
- Missing context (aktorRole, entityId)

**Mitigation:**
- Transaction wrapping untuk ensure logging
- Indexing strategy untuk query performance
- Structured logging dengan field lengkap

---

### CC-03: TTE Security dan Non-Repudiation

**Stakeholders:** Semua user (terutama Kepala OPD, Biro Organisasi, Koordinator Tim Penyusun)
**Priority:** High
**Status:** Active

**Summary:** Tanda Tangan Elektronik harus secure, non-repudiable, dan enforce urutan penandatanganan: Biro → Koordinator → Kepala OPD.

**Requirements:**
- TTE-01 s.d. TTE-13 (KredensialTTE, RiwayatTandaTangan, sequential TTE)
- PIN hash (bcrypt, 10 rounds)
- Document hash untuk setiap signature
- Email verification sebelum TTE

**Security Measures:**
- PIN hash di server (bukan client-side)
- JWT token dengan expiry pendek (1h)
- Rate limiting untuk PIN attempts
- Audit trail untuk failed TTE attempts

**Risks:**
- PIN hardcoded di client (demo mode)
- Replay attack pada TTE signature
- Urutan TTE tidak enforced

**Mitigation:**
- Phase 7: Ganti PIN hardcoded dengan server-side verification
- Document hash + timestamp untuk prevent replay
- Service layer validation untuk enforce urutan

---

### CC-04: Role-Based Access Control (RBAC)

**Stakeholders:** Semua user
**Priority:** High
**Status:** Active

**Summary:** Akses ke endpoint dan UI harus berdasarkan role (biro-organisasi, tim-penyusun, tim-evaluasi, kepala-opd) dengan filtering per OPD.

**Requirements:**
- AUTH-01 s.d. AUTH-08 (JWT auth, role guards, constraint per OPD)
- NF-01, NF-18, NF-19, NF-22, NF-23 (PRD-ANALISIS-SISTEM.md)

**Implementation:**
- Server: JWT guard + roles guard di setiap endpoint
- Client: Route guard berdasarkan role dari Zustand store
- Data filtering berdasarkan opdId dari JWT token

**Risks:**
- Client-side bypass (user edit localStorage role)
- Missing authorization di endpoint baru
- opdId tidak ter-filter dengan benar

**Mitigation:**
- Server-side validation adalah source of truth
- Global guard untuk semua endpoints
- Unit tests untuk authorization logic

---

### CC-05: SOP Lifecycle Management

**Stakeholders:** Tim Penyusun, Biro Organisasi, Kepala OPD
**Priority:** High
**Status:** Active

**Summary:** SOP lifecycle (DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU → DICABUT/DIGANTIKAN) harus enforced dengan valid transitions saja.

**Requirements:**
- SOP-01 s.d. SOP-24 (Full lifecycle, metadata, prosedur)
- PLK-01 s.d. PLK-08 (Prosedur steps, swimlane, branching)
- [P0-D] Status transisi valid (terminal states)

**Implementation:**
- Status transition matrix di service layer
- Validation sebelum setiap status change
- Trigger database untuk constraint [P0-B] (1 BERLAKU per SOP)

**Risks:**
- Invalid status transition (misal: DRAFT → BERLAKU)
- Multiple DetailSOP BERLAKU untuk SOP yang sama
- Prosedur steps tanpa pelaksana terdaftar

**Mitigation:**
- VALID_TRANSITIONS const di code
- Transaction dengan row-level lock
- FK constraint ke DetailSOPPelaksana

---

### CC-06: Evaluasi Workflow dan Optimistic Locking

**Stakeholders:** Tim Evaluasi, Biro Organisasi
**Priority:** High
**Status:** Active

**Summary:** Evaluasi workflow harus support concurrent evaluators dengan optimistic locking untuk prevent lost update pada NilaiEvaluasi.

**Requirements:**
- EVL-01 s.d. EVL-13 (PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi)
- [P0-E] Optimistic locking via version field
- [P1-B] TERJADWAL wajib nilaiOPD, MANDIRI NULL

**Implementation:**
- Version field di NilaiEvaluasi
- Version check saat update (where clause)
- LogNilaiEvaluasi untuk immutable audit trail

**Risks:**
- Lost update saat 2 evaluator edit SOP sama bersamaan
- Version mismatch tidak ditangani dengan baik
- LogNilaiEvaluasi tidak tercatat

**Mitigation:**
- Optimistic locking pattern di repository
- Retry logic untuk version conflict
- Transaction wrapping untuk ensure logging

---

### CC-07: Data Consistency dan Delete Behavior

**Stakeholders:** Biro Organisasi (admin)
**Priority:** High
**Status:** Active

**Summary:** Delete behavior (Cascade/Restrict/SetNull) harus sesuai ERD untuk maintain referential integrity dan avoid orphaned records.

**Requirements:**
- DB-02 (Relasi antar tabel dengan delete behavior benar)
- ERD-DESKRIPSI.md (Legenda delete behavior)

**Delete Behavior Summary:**
- **Cascade:** SOP → DetailSOP → (LangkahSOP, DiagramLayout, LampiranTeks, DasarHukum, SopTerkait, LogEditSOP, Komentar)
- **Restrict:** OPD tidak bisa dihapus kalau masih ada child entities; DetailSOP tidak bisa dihapus kalau sudah ada RiwayatTandaTangan atau NilaiEvaluasi
- **SetNull:** DetailSOP.salindDariDetailSopId saat sumber dihapus; NilaiEvaluasi.dinilaiOlehId saat evaluator dihapus

**Risks:**
- Multi-path cascade deadlock (LangkahSOP → DiagramEdge/NodePosition)
- Orphaned records saat delete parent
- Accidental delete data penting

**Mitigation:**
- Service layer delete order: DiagramEdge → DiagramNodePosition → LangkahSOP
- FK constraints dengan proper delete behavior
- Soft-delete untuk OPD dan Pengguna (deletedAt field)

---

### CC-08: Performance dan Scalability

**Stakeholders:** Semua user
**Priority:** Medium
**Status:** Active

**Summary:** Sistem harus responsive dengan query optimization, indexing strategy, dan pagination untuk handle large datasets.

**Requirements:**
- NF-05, NF-06, NF-07 (Loading state, pagination, lazy loading)
- DB-05 (Indexing strategy untuk FK dan query pattern)

**Implementation:**
- Index pada opdId, status, userId, createdAt
- Pagination untuk list endpoints
- Select projections untuk avoid over-fetching

**Risks:**
- Query lambat saat data besar
- N+1 query problem
- Missing indexes pada FK

**Mitigation:**
- Prisma query optimization (select, include)
- Index migration script
- Query profiling dengan Prisma logs

---

## Cross-Cutting Concerns

### CCC-01: Error Handling dan Logging

**Summary:** Global exception handling dan structured logging untuk semua errors dengan Winston.

**Implementation:**
- GlobalExceptionFilter di NestJS
- Winston logger dengan file rotation
- Error codes untuk client-side handling

### CCC-02: Validation dan Input Sanitization

**Summary:** DTO validation dengan class-validator untuk semua inputs.

**Implementation:**
- ValidationPipe global (whitelist, forbidNonWhitelisted, transform)
- Custom validators untuk constraint bisnis
- Input sanitization untuk prevent XSS/SQL injection

### CCC-03: Configuration Management

**Summary:** Environment-based configuration dengan `.env` files.

**Implementation:**
- ConfigModule.forRoot() di NestJS
- `.env.example` untuk documentation
- Validation untuk required env vars

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
