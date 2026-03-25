# Phase 1: Database & Infrastructure - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Design and migrate the complete Prisma schema with all 18 domain tables for the SOP management system on MariaDB. This phase produces a clean, runnable `prisma migrate dev` with all FK constraints, enums, and relations in place. No business logic — pure data layer.

</domain>

<decisions>
## Implementation Decisions

### ERD Source
- Derive schema from client TypeScript types (`client/src/lib/types/`) + `docs/WORKFLOW-SOP.md` as the authoritative spec
- No separate ERD document exists — client types ARE the ERD
- 18 tables confirmed (see table list in code_context below)

### User Model & Roles
- Single role per user — `role` is a Prisma enum on the `User` model (4 values: `BIRO_ORGANISASI`, `TIM_EVALUASI`, `TIM_PENYUSUN`, `KEPALA_OPD`)
- No join table needed
- User model needs these additions to the existing scaffold: `role`, `opdId` (nullable FK → OPD, required for TIM_PENYUSUN and KEPALA_OPD), `nip`, `jabatan`, `pangkat`, `nohp`
- Remove `Post` model and `posts` relation — Posts module is scaffold-only

### SOP Metadata Storage
- Nested arrays use **separate relational tables** (not JSON columns):
  - `LawBasis` table: id, sopId (FK), text
  - `RelatedSOP` join table: sopId, relatedSopId (self-referential M:M on SOP)
  - `Equipment` table: id, sopId (FK), text
  - `RecordData` table: id, sopId (FK), text
  - Scalar metadata fields (picName, picNumber, section, warning, etc.) stored as columns on `SOP` or a `SOPMetadata` one-to-one table
- This approach matches the 18-table count and keeps data queryable

### Soft Delete Strategy
- **No blanket `deletedAt`** — only where business logic explicitly requires state tracking:
  - `Peraturan.status` → enum: `BERLAKU` | `DICABUT` (existing field, no deletedAt)
  - `TimPenyusun.status` → `AKTIF` | `NONAKTIF` + `endedAt` timestamp
  - `TimEvaluasiAnggota.status` → `AKTIF` | `NONAKTIF` + `endedAt` timestamp
  - `SOP.status` → enum with `DICABUT` as terminal state
  - All other tables: hard delete (no deletedAt)

### MariaDB Compatibility
- `provider = "mysql"` already set in schema — keep as-is
- Prisma enums map to MySQL ENUM type — fine for MariaDB
- `@default(uuid())` uses `uuid()` function — supported in MariaDB 10.3+
- No `@db.Text` vs `VARCHAR` length issues: use `@db.Text` for long fields (content, keterangan, warning)
- No `@@unique` composite issues — MariaDB handles these fine

### Existing Scaffold
- Keep `User` model, extend it with domain fields
- Remove `Post` model entirely (Posts module is scaffold-only, not domain)
- Prisma `output` path `../src/generated/prisma` stays as-is

### Claude's Discretion
- Exact column names (snake_case vs camelCase): follow Prisma convention (camelCase fields, snake_case `@map` for DB columns if needed)
- Whether `SOPMetadata` is a separate table or columns on `SOP` — Claude decides based on normalization
- ID type for all new models: String with `@default(uuid())` (matching existing User model pattern)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain Types (authoritative spec for all 18 tables)
- `client/src/lib/types/sop.ts` — SOP, ProsedurRow, PelaksanaSOP, StatusSOP enum values, ProsedurStepType
- `client/src/lib/types/opd.ts` — OPD, KepalaOPD fields
- `client/src/lib/types/tim.ts` — TimPenyusun (with roleInternal: Koordinator|Anggota), TimEvaluasiAnggota
- `client/src/lib/types/peraturan.ts` — Peraturan, StatusPeraturan, RiwayatVersiEntry
- `client/src/lib/types/tte.ts` — TTEProfile, TTESignature, TTEAuditEntry, TTERole enum
- `client/src/lib/types/verifikasi-batch.ts` — VerifikasiBatch, SOPItem, StatusEvaluasi
- `client/src/lib/types/audit.ts` — AuditLogEntry, AuditAction enum (11 values)
- `client/src/lib/types/komentar.ts` — KomentarItem, KomentarStatus
- `client/src/lib/types/actor.ts` — ActorProfile (base shape: namaLengkap, nip, jabatan, pangkat, email, nohp)

### Workflow & Status Transitions
- `docs/WORKFLOW-SOP.md` — authoritative SOP status flow, role responsibilities, BA signing sequence

### Existing Schema (to extend)
- `server/prisma/schema.prisma` — current User + Post scaffold; datasource already set to mysql

### Requirements
- `.planning/REQUIREMENTS.md` — DB-01 through DB-04 (Phase 1 requirements)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/prisma/schema.prisma` — datasource (mysql) and generator config reusable; User model extends rather than replaces
- `server/src/generated/prisma/` — Prisma client output path already configured; re-run `prisma generate` after schema changes
- `server/src/common/prisma/prisma.service.ts` — PrismaService already exists and is global; no changes needed here

### Established Patterns
- `String @id @default(uuid())` — ID pattern used on existing User model; use for all new models
- `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` — timestamp pattern on all existing models; apply consistently
- `prisma.config.ts` at server root — migration config (check before running migrate)

### Integration Points
- Posts module (`server/src/modules/posts/`) references `User` via authorId FK — **remove Post model means removing PostsModule too**
- `server/src/app.module.ts` imports PostsModule — remove that import when Posts module is deleted
- All future domain modules will import PrismaModule (already global) and use PrismaService

### 18 Tables (Inferred from Client Types)
1. `User` — extended with role, opdId, nip, jabatan, pangkat, nohp
2. `OPD` — name, email, phone, kode (for SOP numbering)
3. `Peraturan` — nomor, tahun, tentang, status(BERLAKU|DICABUT), version, fileUrl
4. `SOP` — nomorSOP, judul, status, opdId, versi, plus scalar metadata cols
5. `SOPMetadata` OR columns on SOP — picName, section, warning, institutionLines (text)
6. `LawBasis` — id, sopId, text (dasar hukum)
7. `Equipment` — id, sopId, text
8. `RecordData` — id, sopId, text
9. `RelatedSOP` — sopId, relatedSopId (self-join M:M)
10. `ProsedurRow` — no, kegiatan, type(TERMINATOR|TASK|DECISION), nextStepYesId, nextStepNoId, order, mutu fields
11. `Pelaksana` — namaLengkap, nip, jabatan, pangkat, email, nohp, opdId
12. `ProsedurRowPelaksana` — prosedurRowId, pelaksanaId (M:M join)
13. `TimPenyusun` — userId, opdId, status(AKTIF|NONAKTIF), roleInternal(KOORDINATOR|ANGGOTA), endedAt
14. `TimEvaluasiAnggota` — userId, status(AKTIF|NONAKTIF), endedAt
15. `VerifikasiBatch` — opdId, jenis(INISIASI_BIRO|REQUEST_OPD), status(AKTIF|SELESAI|TERVERIFIKASI), nomorBA, timEvaluasiId
16. `EvaluasiItem` — batchId, sopId, hasil(SESUAI|REVISI_BIRO), catatan, rekomendasi
17. `TTEProfile` — userId, nip, jabatan, pangkat, nohp, pinHash, emailVerified, role(TTERole)
18. `TTESignature` — userId, role, documentId, documentLabel, referenceId, documentHash, signedAt
19. `AuditLog` — sopId, action(AuditAction), aktorId, aktorRole, statusSebelum, statusSesudah, keterangan
20. `Komentar` — sopId, userId, role, isi, bagian, status(OPEN|RESOLVED)

**Note:** Count may be 19-20 depending on whether SOPMetadata becomes its own table vs columns on SOP, and whether AuditLog + Komentar are both included. Planner should aim for exactly 18 — consider merging where appropriate (e.g., SOPMetadata fields → columns on SOP table).

</code_context>

<specifics>
## Specific Ideas

- SOP numbering format: `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]` — OPD table needs a `kode` field (short code)
- `TimPenyusun.roleInternal` must support Koordinator vs Anggota — only Koordinator can submit evaluasi (SOP-04)
- `TTERole` has 3 values (`kepala-opd`, `biro-organisasi`, `tim-penyusun`) — separate from User.role enum (4 values)
- `AuditAction` has exactly 11 values from `audit.ts`: BUAT_SOP, SIMPAN_DRAFT, SELESAI_PENYUSUNAN, AJUKAN_EVALUASI, MULAI_EVALUASI, KIRIM_HASIL_EVALUASI, VERIFIKASI_BATCH, TTD_BA_KEPALA_OPD, SAHKAN_SOP, CABUT_SOP, REVISI_DARI_EVALUATOR

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-database-infrastructure*
*Context gathered: 2026-03-25*
