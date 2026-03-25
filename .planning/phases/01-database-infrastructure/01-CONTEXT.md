# Phase 1: Database & Infrastructure - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Design and migrate the complete Prisma schema for the SOP management system on MariaDB. Includes all domain tables, enums, FK constraints, indexes, cascade rules, and seed data with FakerJS. This phase produces a clean, runnable `prisma migrate dev` with all relationships enforced. No business logic — pure data layer + seed.

</domain>

<decisions>
## Implementation Decisions

### Cascade & Deletion Rules
- **OPD → SOP/User/Pelaksana/TimPenyusun/VerifikasiBatch**: `Restrict` — OPD tidak boleh dihapus kalau masih ada data terkait
- **User → AuditLog/TTESignature/SOP**: `Restrict` — User tidak boleh dihapus, jejak audit harus utuh
- **VerifikasiBatch → EvaluasiItem**: `Restrict` — BA adalah dokumen resmi, tidak boleh dihapus
- **SOP → LawBasis/Equipment/RecordData/ProsedurRow/ImplementQualification**: `Cascade` — child data tidak bermakna tanpa SOP induk
- **ProsedurRow → ProsedurRowPelaksana**: `Cascade` — join row tidak bermakna tanpa prosedur

### Index Strategy
- **Semua FK column** mendapat `@index` — MariaDB tidak auto-index FK seperti PostgreSQL
- **Composite index** `@@index([opdId, status])` pada model SOP — query paling umum di hampir semua halaman
- FK yang perlu `@index`: `SOP.opdId`, `SOP.peraturanId`, `SOP.createdById`, `SOP.lastEditedById`, `SOP.picUserId`, `LawBasis.sopId`, `Equipment.sopId`, `RecordData.sopId`, `ImplementQualification.sopId`, `ProsedurRow.sopId`, `Pelaksana.opdId`, `TimPenyusun.userId`, `TimPenyusun.opdId`, `TimEvaluasiAnggota.userId`, `VerifikasiBatch.opdId`, `VerifikasiBatch.verifiedByUserId`, `VerifikasiBatch.signedByKoordinatorUserId`, `EvaluasiItem.batchId`, `EvaluasiItem.sopId`, `EvaluasiItem.evaluatorId`, `AuditLog.sopId`, `AuditLog.aktorId`, `TTESignature.userId`, `TTESignature.sopId`, `TTESignature.batchId`, `Komentar.sopId`, `Komentar.userId`

### Seed Data Strategy
- **FakerJS** untuk generate seed data di Phase 1 bersamaan migration
- Data baru (BUKAN mirror dari client seed JSON) — independen
- Password plaintext dulu (hashing belum ada, ditangani Phase 2 Auth)
- Scope seed: users semua role, OPD, peraturan contoh — cukup untuk verify FK constraints dan relasi

### Evaluasi: Terjadwal vs Mandiri
- **Dua tipe evaluasi**, keduanya melewati alur verifikasi yang sama (BA signing wajib)
- Rename `JenisBatch` enum values: `INISIASI_BIRO` → `TERJADWAL`, `REQUEST_OPD` → `MANDIRI`
- **Evaluasi Terjadwal**: Biro menyurati OPD (di luar sistem), OPD mengirim batch SOP. Ada penilaian OPD (skor 1-5). Semua SOP harus pass sebelum penilaian OPD bisa dilakukan.
- **Evaluasi Mandiri**: Di luar siklus terjadwal, bisa 1-2 SOP saja. TIDAK ada penilaian OPD, hanya evaluasi per-SOP.
- **Perbedaan constraint**: `nilaiOPD` hanya diisi jika `jenis = TERJADWAL`. Service layer enforce ini.

### Evaluator (Tim Evaluasi) — Open Pool
- **HAPUS `timEvaluasiId` dari VerifikasiBatch** — tidak ada penugasan evaluator ke batch
- Semua anggota Tim Evaluasi bisa melihat dan mengevaluasi batch/SOP manapun dari OPD manapun
- Tracking siapa yang evaluasi per SOP dilakukan di `EvaluasiItem.evaluatorId` (FK ke User)
- 1 evaluator bisa evaluasi SOP mana saja, 1 SOP dievaluasi oleh 1 evaluator

### Riwayat Evaluasi — Append-Only
- Setiap evaluasi = **record baru** di EvaluasiItem (append, bukan update in-place)
- SOP yang direvisi dan dievaluasi ulang punya multiple EvaluasiItem records
- Query riwayat per SOP: `WHERE sopId = ? ORDER BY createdAt`

### Schema Additions (Gap Fixes)
- **VerifikasiBatch**: tambah `verifiedByUserId` (nullable FK ke User) — tracking siapa dari Biro yang verifikasi BA
- **VerifikasiBatch**: tambah `signedByKoordinatorUserId` (nullable FK ke User) — tracking siapa Koordinator yang TTD BA
- **VerifikasiBatch**: tambah `tanggalEvaluasi` (DateTime?) — sesuai client type
- **VerifikasiBatch**: tambah `nilaiOPD` (Int?, skala 1-5 Likert) — penilaian OPD, hanya untuk TERJADWAL
- **VerifikasiBatch**: HAPUS `timEvaluasiId` — tidak ada penugasan, evaluator open pool
- **EvaluasiItem**: tambah `rekomendasi` (Text?) — sesuai client SOPItem type
- **EvaluasiItem**: tambah `evaluatorId` (FK ke User) — tracking siapa yang evaluasi per SOP
- **TTESignature**: tambah `sopId` (nullable FK ke SOP) — link eksplisit untuk audit TTE per SOP
- **TTESignature**: tambah `batchId` (nullable FK ke VerifikasiBatch) — link eksplisit untuk audit TTE per BA
- **Model baru: ImplementQualification** (id, sopId, text) — seperti LawBasis/Equipment pattern
- **Model baru: Komentar** (id, sopId, userId, role, isi, bagian, status) — komentar evaluasi per SOP
- **DB constraint**: CHECK constraint atau trigger untuk memastikan SOP BERLAKU punya TTESignature terkait — enforcement di DB level (double protection selain API layer)
- **Update requirement DB-01**: jumlah tabel di-update ke jumlah aktual (bukan 18)

### Existing Decisions (Tetap Berlaku)
- SOPMetadata fields merged into SOP model (1:1 normalization)
- UUID `@default(uuid())` sebagai ID pattern semua model
- RelatedSOP composite PK `@@id([sopId, relatedSopId])`
- ProsedurRow self-FK named relations "YesStep"/"NoStep"
- `provider = "mysql"` untuk MariaDB
- `@db.Text` untuk long text fields
- No blanket soft delete — hanya di model yang business logic butuh (Peraturan, Tim, SOP status)
- Tidak ada kategori SOP — field `kategori` dari client type TIDAK dimasukkan ke schema

### Claude's Discretion
- Exact column naming convention (camelCase Prisma fields, `@map` jika perlu)
- Urutan fields dalam model
- Apakah CHECK constraint di MariaDB bisa langsung di Prisma atau perlu raw SQL di migration
- FakerJS seed: jumlah records per tabel (minimal enough to verify constraints)
- Komentar model detail fields (selain yang disebutkan di atas)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain Types (authoritative spec)
- `client/src/lib/types/sop.ts` — SOP, ProsedurRow, PelaksanaSOP, StatusSOP enum values
- `client/src/lib/types/opd.ts` — OPD, KepalaOPD fields
- `client/src/lib/types/tim.ts` — TimPenyusun (roleInternal: Koordinator|Anggota), TimEvaluasiAnggota
- `client/src/lib/types/peraturan.ts` — Peraturan, StatusPeraturan
- `client/src/lib/types/tte.ts` — TTEProfile, TTESignature, TTERole enum
- `client/src/lib/types/verifikasi-batch.ts` — VerifikasiBatch, SOPItem, StatusEvaluasi
- `client/src/lib/types/audit.ts` — AuditLogEntry, AuditAction enum (11 values)
- `client/src/lib/types/komentar.ts` — KomentarItem, KomentarStatus
- `client/src/lib/types/actor.ts` — ActorProfile base shape

### Workflow & Status Transitions
- `docs/WORKFLOW-SOP.md` — authoritative SOP status flow, role responsibilities, BA signing sequence

### Existing Schema (to modify)
- `server/prisma/schema.prisma` — current 18-model schema; needs additions per decisions above

### Requirements
- `.planning/REQUIREMENTS.md` — DB-01 through DB-04 (Phase 1 requirements, DB-01 table count to be updated)

### Project Decisions
- `.planning/PROJECT.md` — BA verifikasi vs pengesahan distinction, 3NF normalization rules, tech stack constraints

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/prisma/schema.prisma` — 18-model schema already written; needs targeted modifications (not rewrite)
- `server/src/generated/prisma/` — Prisma client output path configured; re-run `prisma generate` after changes
- `server/src/common/prisma/prisma.service.ts` — PrismaService global, no changes needed
- `server/src/modules/users/dto/create-user.dto.ts` — DTO already references generated UserRole enum

### Established Patterns
- `String @id @default(uuid())` — ID pattern on all models
- `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` — timestamp pattern
- `@db.Text` for long content fields
- Named `@relation` for self-referential models

### Integration Points
- Posts module already removed (Plan 01-01 complete)
- All domain modules will import PrismaModule (global) and use PrismaService
- FakerJS seed script: `server/prisma/seed.ts` (to be created)

</code_context>

<specifics>
## Specific Ideas

- SOP numbering format: `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]` — OPD.kode field already in schema
- `TimPenyusun.roleInternal` supports Koordinator vs Anggota — Koordinator can submit evaluasi and sign BA
- `TTERole` has 3 values, separate from UserRole enum (4 values)
- `AuditAction` has exactly 11 values from client type
- `HasilEvaluasi` should keep `PERLU_PERBAIKAN` value or replace? Currently schema has SESUAI, PERLU_PERBAIKAN, REVISI_BIRO — but workflow only uses SESUAI and REVISI_BIRO
- Penilaian OPD skor 1-5 (Likert scale): 1=Sangat Kurang, 2=Kurang, 3=Cukup, 4=Baik, 5=Sangat Baik

</specifics>

<deferred>
## Deferred Ideas

- **UX Action Clarity**: Terlalu banyak status → perlu simplifikasi UX di semua aktor agar action-first. Concern ini untuk Phase 5-7 saat integrasi client-server.
- **Dashboard per-role dengan progress tracking**: Setiap role perlu melihat "apa yang harus saya lakukan sekarang" — concern Phase 5+.
- **Notification system**: Notifikasi antar role saat status berubah — concern Phase 5+.
- **Bulk pengesahan**: Kepala OPD bisa TTD semua SOP sekaligus — concern Phase 7 TTE.

</deferred>

---

*Phase: 01-database-infrastructure*
*Context gathered: 2026-03-25*
