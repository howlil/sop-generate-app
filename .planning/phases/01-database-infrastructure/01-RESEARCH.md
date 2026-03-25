# Phase 1: Database & Infrastructure - Research

**Researched:** 2026-03-25
**Domain:** Prisma 7 schema design + MariaDB migration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**ERD Source**
- Derive schema from client TypeScript types (`client/src/lib/types/`) + `docs/WORKFLOW-SOP.md` as the authoritative spec
- No separate ERD document exists — client types ARE the ERD
- 18 tables confirmed (see table list in CONTEXT.md code_context)

**User Model & Roles**
- Single role per user — `role` is a Prisma enum on the `User` model (4 values: `BIRO_ORGANISASI`, `TIM_EVALUASI`, `TIM_PENYUSUN`, `KEPALA_OPD`)
- No join table needed
- User model additions to existing scaffold: `role`, `opdId` (nullable FK to OPD), `nip`, `jabatan`, `pangkat`, `nohp`
- Remove `Post` model and `posts` relation — Posts module is scaffold-only

**SOP Metadata Storage**
- Nested arrays use separate relational tables (not JSON columns):
  - `LawBasis` table: id, sopId (FK), text
  - `RelatedSOP` join table: sopId, relatedSopId (self-referential M:M on SOP)
  - `Equipment` table: id, sopId (FK), text
  - `RecordData` table: id, sopId (FK), text
- Scalar metadata fields stored as columns on `SOP` or a `SOPMetadata` one-to-one table

**Soft Delete Strategy**
- No blanket `deletedAt` — only explicit state tracking where business logic requires:
  - `Peraturan.status` → enum: `BERLAKU` | `DICABUT`
  - `TimPenyusun.status` → `AKTIF` | `NONAKTIF` + `endedAt` timestamp
  - `TimEvaluasiAnggota.status` → `AKTIF` | `NONAKTIF` + `endedAt` timestamp
  - `SOP.status` → enum with `DICABUT` as terminal state
  - All other tables: hard delete (no deletedAt)

**MariaDB Compatibility**
- `provider = "mysql"` already set in schema — keep as-is
- Prisma enums map to MySQL ENUM type — fine for MariaDB
- `@default(uuid())` uses `uuid()` function — supported in MariaDB 10.3+
- Use `@db.Text` for long fields (content, keterangan, warning)

**Existing Scaffold**
- Keep `User` model, extend it with domain fields
- Remove `Post` model entirely (Posts module is scaffold-only)
- Prisma `output` path `../src/generated/prisma` stays as-is

### Claude's Discretion
- Exact column names (snake_case vs camelCase): follow Prisma convention (camelCase fields, snake_case `@map` for DB columns if needed)
- Whether `SOPMetadata` is a separate table or columns on `SOP` — Claude decides based on normalization
- ID type for all new models: String with `@default(uuid())` (matching existing User model pattern)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DB-01 | Skema Prisma mengimplementasikan seluruh 18 tabel ERD yang disetujui | Full table inventory derived from all client type files; 18 tables enumerated with field mappings |
| DB-02 | Semua relasi antar tabel (FK, constraints) terdefinisi dengan benar di schema | FK graph documented; self-referential M:M on SOP identified; composite PK patterns for join tables |
| DB-03 | Enum Prisma untuk semua status field (StatusSOP, AuditAction, TTERole, dll) | All 8 enums extracted verbatim from client types; exact string-to-enum identifier mapping provided |
| DB-04 | Migration Prisma dapat dijalankan clean pada database MariaDB kosong | Existing scaffold uses `@prisma/adapter-mariadb` with driver adapter pattern; DATABASE_URL via env; migration command documented |
</phase_requirements>

---

## Summary

This phase designs and migrates the complete Prisma schema for the SOP management system onto MariaDB. The existing server scaffold already has `prisma/schema.prisma` with a MySQL datasource, a Prisma client output path, and a `PrismaService` that uses `@prisma/adapter-mariadb` (the driver adapter pattern required for Prisma 7+). The work is entirely additive schema-writing: delete the `Post` model, extend the `User` model with domain fields, and add 17 new domain models covering all SOP lifecycle entities.

The authoritative spec for every table's shape is the client TypeScript types in `client/src/lib/types/`. All enums have been extracted from these files. The key architectural decision already made is to use separate relational tables for nested array data (LawBasis, Equipment, RecordData, RelatedSOP) rather than JSON columns, which keeps data queryable and foreign-key enforced. The `SOPMetadata` question (separate table vs columns on SOP) favors columns-on-SOP given the 1:1 relationship and the goal of exactly 18 tables.

**Primary recommendation:** Write the full schema in one pass, run `prisma migrate dev --name init`, then verify with a seed script that tests FK constraint enforcement on all critical relationships.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prisma | ^7.5.0 | Schema definition, migrations, type generation | Already installed; project is built on it |
| @prisma/client | ^7.5.0 | Generated type-safe DB client | Paired with prisma; output to `src/generated/prisma` |
| @prisma/adapter-mariadb | ^7.5.0 | MariaDB driver adapter for Prisma 7 | Already in use in PrismaService; required for Prisma 7 MariaDB support |

**Note on Prisma 7 Driver Adapters:** Prisma 7 changed how database connections work. The project already correctly uses the driver adapter pattern: `@prisma/adapter-mariadb` is instantiated with connection config and passed to `PrismaClient({ adapter })`. This is the required pattern — the old `provider = "mysql"` in datasource block is kept for schema type resolution but actual connection goes through the adapter.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | (via dotenv/config) | DATABASE_URL and connection env vars | Already imported in prisma.config.ts |

### Installation

No new packages needed. All required packages are already installed in `server/package.json`:
- `prisma@^7.5.0`
- `@prisma/client@^7.5.0`
- `@prisma/adapter-mariadb@^7.5.0`

---

## Architecture Patterns

### Recommended Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Complete domain schema (write here)
│   └── migrations/            # Auto-generated by prisma migrate dev
├── prisma.config.ts           # Already configured — do not change
├── src/
│   ├── generated/prisma/      # Auto-generated — do not hand-edit
│   └── common/prisma/
│       ├── prisma.module.ts   # Already global
│       └── prisma.service.ts  # Already configured — do not change
└── ...
```

### Pattern 1: ID Fields

Every new model uses the same UUID pattern as the existing User model:

```prisma
model Example {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Use String UUID (not Int autoincrement)** — this matches the existing scaffold and the client type interfaces (all `id: string`).

### Pattern 2: Prisma Enum Definition

Enums are defined at the schema level and referenced as field types. For MariaDB, Prisma maps these to native MySQL ENUM columns.

```prisma
enum StatusSOP {
  DRAFT
  SEDANG_DISUSUN
  SIAP_DIEVALUASI
  DIAJUKAN_EVALUASI
  SEDANG_DIEVALUASI
  REVISI_DARI_TIM_EVALUASI
  SIAP_DIVERIFIKASI
  DIVERIFIKASI_BIRO_ORGANISASI
  BERLAKU
  DICABUT
}

model SOP {
  id     String    @id @default(uuid())
  status StatusSOP @default(DRAFT)
  ...
}
```

### Pattern 3: FK Relations

```prisma
model SOP {
  id    String @id @default(uuid())
  opdId String
  opd   OPD    @relation(fields: [opdId], references: [id])
}

model OPD {
  id   String @id @default(uuid())
  sops SOP[]
}
```

Always define BOTH sides of a relation (the FK side AND the back-reference array side).

### Pattern 4: Self-Referential M:M Join Table (RelatedSOP)

The `RelatedSOP` join table is a self-referential many-to-many. Prisma requires an explicit join model when the relation is self-referencing:

```prisma
model RelatedSOP {
  sopId        String
  relatedSopId String
  sop          SOP    @relation("SOPRelations", fields: [sopId], references: [id])
  relatedSop   SOP    @relation("RelatedSOPRelations", fields: [relatedSopId], references: [id])

  @@id([sopId, relatedSopId])
}

model SOP {
  ...
  relatedSOPs    RelatedSOP[] @relation("SOPRelations")
  relatedBySOPs  RelatedSOP[] @relation("RelatedSOPRelations")
}
```

### Pattern 5: One-to-Many Child Tables (LawBasis, Equipment, RecordData)

```prisma
model LawBasis {
  id    String @id @default(uuid())
  sopId String
  text  String @db.Text
  sop   SOP    @relation(fields: [sopId], references: [id])
}
```

No `createdAt`/`updatedAt` needed on these child detail tables — they are created/deleted with the parent SOP.

### Pattern 6: Composite PK on M:M Join Tables

For ProsedurRowPelaksana join:

```prisma
model ProsedurRowPelaksana {
  prosedurRowId String
  pelaksanaId   String
  prosedurRow   ProsedurRow @relation(fields: [prosedurRowId], references: [id])
  pelaksana     Pelaksana   @relation(fields: [pelaksanaId], references: [id])

  @@id([prosedurRowId, pelaksanaId])
}
```

### Pattern 7: @db.Text for Long Fields

```prisma
model SOP {
  warning          String? @db.Text
  keterangan       String? @db.Text
  institutionLines String? @db.Text   // JSON-serialized string[] or newline-separated
}
```

### Anti-Patterns to Avoid

- **Implicit many-to-many with `@relation` on both sides without an explicit join model:** For self-referential M:M (RelatedSOP), Prisma requires an explicit join table — do not use implicit syntax.
- **Skipping back-relations:** Every `@relation` FK field must have a corresponding array relation on the other model, or Prisma schema validation will fail.
- **Using Int autoincrement IDs:** Breaks consistency with existing User model and client type expectations (`id: string`).
- **JSON columns for arrays:** Decided against — use separate tables for queryability and FK enforcement.
- **Putting `@db.Text` on short enum/status fields:** Only use `@db.Text` for genuinely long text (descriptions, warnings, content).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom UUID function | `@default(uuid())` in schema | Prisma built-in; DB-level generation |
| Timestamp tracking | Manual timestamp fields | `@default(now())` and `@updatedAt` | Prisma built-in; `@updatedAt` auto-updates on every write |
| Enum validation | Application-level string checks | Prisma enum types | Database-level ENUM constraint; Prisma generates typed enum in client |
| FK constraints | Application-level validation | Prisma `@relation` with `references` | DB enforces referential integrity |
| Migration management | Manual ALTER TABLE scripts | `prisma migrate dev` | Full migration history, rollback capability, idempotent |
| Prisma client generation | Manual type files | `prisma generate` | Generates complete typed client from schema |

**Key insight:** Schema changes propagate through `prisma migrate dev` (DDL) and `prisma generate` (TypeScript types) automatically. Never write manual SQL migrations.

---

## Complete Table Inventory (18 tables)

Derived from client types. The recommendation is to merge `SOPMetadata` fields into `SOP` to stay at 18 tables:

| # | Table | Source Type | Key Fields |
|---|-------|-------------|-----------|
| 1 | `User` | actor.ts + scaffold | id, email, name, password, role(UserRole), opdId(nullable FK→OPD), nip, jabatan, pangkat, nohp |
| 2 | `OPD` | opd.ts | id, name, email, phone, kode (for SOP numbering) |
| 3 | `Peraturan` | peraturan.ts | id, nomor, tahun, tentang, status(StatusPeraturan), version, fileUrl, createdById(FK→User) |
| 4 | `SOP` | sop.ts (SOPDaftarItem + SOPDetailMetadata) | id, nomorSOP, judul, status(StatusSOP), opdId(FK), peraturanId(FK), versi, picName, picNumber, picRole, section, warning, institutionLines, createdById(FK), lastEditedById(FK), createdAt, updatedAt |
| 5 | `LawBasis` | sop.ts (SOPDetailMetadata.lawBasis) | id, sopId(FK), text |
| 6 | `Equipment` | sop.ts (SOPDetailMetadata.equipment) | id, sopId(FK), text |
| 7 | `RecordData` | sop.ts (SOPDetailMetadata.recordData) | id, sopId(FK), text |
| 8 | `RelatedSOP` | sop.ts (SOPDetailMetadata.relatedSop) | sopId(FK), relatedSopId(FK) — composite PK |
| 9 | `ProsedurRow` | sop.ts (ProsedurRow) | id, sopId(FK), no, kegiatan, type(ProsedurStepType), mutuKelengkapan, mutuWaktu, output, keterangan, time, timeUnit, nextStepYesId(nullable FK self), nextStepNoId(nullable FK self), order |
| 10 | `Pelaksana` | sop.ts (PelaksanaSOP) | id, namaLengkap, nip, jabatan, pangkat, email, nohp, deskripsi, opdId(FK) |
| 11 | `ProsedurRowPelaksana` | sop.ts (ProsedurRow.pelaksana) | prosedurRowId(FK), pelaksanaId(FK) — composite PK |
| 12 | `TimPenyusun` | tim.ts (TimPenyusun) | id, userId(FK→User), opdId(FK→OPD), status(StatusTim), roleInternal(RoleInternal), tanggalBergabung, endedAt |
| 13 | `TimEvaluasiAnggota` | tim.ts (TimEvaluasiAnggota) | id, userId(FK→User), status(StatusTim), tanggalBergabung, endedAt |
| 14 | `VerifikasiBatch` | verifikasi-batch.ts | id, opdId(FK), jenis(JenisBatch), status(StatusEvaluasi), catatan, nomorBA, timEvaluasiId(FK→TimEvaluasiAnggota), tanggalRequest, isSignedByKoordinator, tanggalTTDBaByKoordinator |
| 15 | `EvaluasiItem` | verifikasi-batch.ts (SOPItem) | id, batchId(FK→VerifikasiBatch), sopId(FK→SOP), hasil(HasilEvaluasi), catatan, rekomendasi |
| 16 | `TTEProfile` | tte.ts (TTEProfile) | id, userId(FK→User), nip, jabatan, pangkat, nohp, pinHash, emailVerified, role(TTERole), verificationToken |
| 17 | `TTESignature` | tte.ts (TTEAuditEntry + TTESignaturePayload) | id, userId(FK→User), role(TTERole), documentId, documentLabel, referenceId, documentHash, signedAt |
| 18 | `AuditLog` | audit.ts | id, sopId(FK→SOP), action(AuditAction), aktorId(FK→User), aktorRole, statusSebelum(StatusSOP nullable), statusSesudah(StatusSOP), keterangan, createdAt |

**Note on Komentar:** The `komentar.ts` type exists in the client but Komentar is listed as "Out of Scope" (real-time chat). Exclude it to stay at 18 tables. If it must be included, it becomes table 19 and the count adjusts.

---

## Complete Enum Inventory

All enums derived verbatim from client types:

### UserRole (4 values — from CONTEXT.md decisions)
```prisma
enum UserRole {
  BIRO_ORGANISASI
  TIM_EVALUASI
  TIM_PENYUSUN
  KEPALA_OPD
}
```

### StatusSOP (10 values — from sop.ts)
```prisma
enum StatusSOP {
  DRAFT                        // 'Draft'
  SEDANG_DISUSUN               // 'Sedang Disusun'
  SIAP_DIEVALUASI              // 'Siap Dievaluasi'
  DIAJUKAN_EVALUASI            // 'Diajukan Evaluasi'
  SEDANG_DIEVALUASI            // 'Sedang Dievaluasi'
  REVISI_DARI_TIM_EVALUASI     // 'Revisi dari Tim Evaluasi'
  SIAP_DIVERIFIKASI            // 'Siap Diverifikasi'
  DIVERIFIKASI_BIRO_ORGANISASI // 'Diverifikasi Biro Organisasi'
  BERLAKU                      // 'Berlaku'
  DICABUT                      // 'Dicabut'
}
```

### ProsedurStepType (3 values — from sop.ts)
```prisma
enum ProsedurStepType {
  TERMINATOR  // 'terminator'
  TASK        // 'task'
  DECISION    // 'decision'
}
```

### StatusPeraturan (2 values — from peraturan.ts)
```prisma
enum StatusPeraturan {
  BERLAKU  // 'Berlaku'
  DICABUT  // 'Dicabut'
}
```

### TTERole (3 values — from tte.ts)
```prisma
enum TTERole {
  KEPALA_OPD      // 'kepala-opd'
  BIRO_ORGANISASI // 'biro-organisasi'
  TIM_PENYUSUN    // 'tim-penyusun'
}
```

### AuditAction (11 values — from audit.ts)
```prisma
enum AuditAction {
  BUAT_SOP
  SIMPAN_DRAFT
  SELESAI_PENYUSUNAN
  AJUKAN_EVALUASI
  MULAI_EVALUASI
  KIRIM_HASIL_EVALUASI
  VERIFIKASI_BATCH
  TTD_BA_KEPALA_OPD
  SAHKAN_SOP
  CABUT_SOP
  REVISI_DARI_EVALUATOR
}
```

### StatusTim (2 values — from tim.ts, shared by TimPenyusun and TimEvaluasiAnggota)
```prisma
enum StatusTim {
  AKTIF     // 'Aktif'
  NONAKTIF  // 'Nonaktif'
}
```

### RoleInternal (2 values — from tim.ts TimPenyusun.roleInternal)
```prisma
enum RoleInternal {
  KOORDINATOR  // 'Koordinator'
  ANGGOTA      // 'Anggota'
}
```

### StatusEvaluasi (3 values — from verifikasi-batch.ts)
```prisma
enum StatusEvaluasi {
  AKTIF        // 'Aktif'
  SELESAI      // 'Selesai'
  TERVERIFIKASI // 'Terverifikasi'
}
```

### JenisBatch (2 values — from verifikasi-batch.ts VerifikasiBatch.jenis)
```prisma
enum JenisBatch {
  INISIASI_BIRO  // 'Inisiasi Biro'
  REQUEST_OPD    // 'Request OPD'
}
```

### HasilEvaluasi (3 values — from sop.ts StatusHasilEvaluasi)
```prisma
enum HasilEvaluasi {
  SESUAI           // 'Sesuai'
  PERLU_PERBAIKAN  // 'Perlu Perbaikan'
  REVISI_BIRO      // 'Revisi Biro'
}
```

---

## Common Pitfalls

### Pitfall 1: Missing DATABASE_URL in .env
**What goes wrong:** `prisma migrate dev` fails with "Environment variable not found: DATABASE_URL" or adapter-mariadb fails to connect.
**Why it happens:** `prisma.config.ts` reads `process.env["DATABASE_URL"]`; PrismaService reads individual `DATABASE_HOST/USER/PASSWORD/NAME` env vars. Both must be present.
**How to avoid:** Ensure `.env` has `DATABASE_URL=mysql://user:pass@host:3306/dbname` AND the individual vars.
**Warning signs:** Error on `prisma migrate dev` before any SQL is executed.

### Pitfall 2: Prisma 7 Requires Driver Adapter for MariaDB
**What goes wrong:** Schema has `provider = "mysql"` but PrismaService uses the adapter pattern. Without `previewFeatures = ["driverAdapters"]` in the generator block, Prisma 7 may warn or error.
**Why it happens:** Prisma 7 moved driver adapters to stable — check whether `previewFeatures` is still needed for this version.
**How to avoid:** Verify `prisma.config.ts` and `prisma generate` both succeed. The existing scaffold already works; do not break it.
**Warning signs:** `prisma generate` warning about driver adapters; type errors in PrismaService after regeneration.

### Pitfall 3: Self-Referential M:M Requires Two Named @relation Decorators
**What goes wrong:** Schema validation error: "A self-relation must have `name` defined" or "Ambiguous relation".
**Why it happens:** Prisma cannot infer which side of a self-join is which without named relations.
**How to avoid:** Use `@relation("SOPRelations")` and `@relation("RelatedSOPRelations")` on both the `RelatedSOP` model fields AND the back-references on `SOP`.

### Pitfall 4: ProsedurRow Self-FK for Branching
**What goes wrong:** `nextStepYesId` and `nextStepNoId` are self-referential FKs on the same model. Circular FK issues can occur if not nullable.
**Why it happens:** DECISION-type steps point to other steps in the same SOP. Steps can be created before their targets are known.
**How to avoid:** Both `nextStepYesId` and `nextStepNoId` must be nullable (`String?`). Use named relations: `@relation("YesStep")` and `@relation("NoStep")`.

### Pitfall 5: Posts Module Still Imports the Post Model
**What goes wrong:** After removing `Post` model from schema, `prisma generate` succeeds but the server fails to compile because `PostsModule` services reference `prisma.post.*`.
**Why it happens:** `app.module.ts` still imports `PostsModule`; post repository still calls `this.prisma.post.findMany()`.
**How to avoid:** Delete `server/src/modules/posts/` entirely AND remove the `PostsModule` import from `app.module.ts` before running `prisma generate`.

### Pitfall 6: @db.Text Not Supported on Enum Fields
**What goes wrong:** Schema validation error if `@db.Text` is accidentally applied to an enum-typed field.
**Why it happens:** `@db.Text` is only valid on `String` fields.
**How to avoid:** Only apply `@db.Text` to `String` typed fields.

### Pitfall 7: Composite PK Join Tables and Prisma Client CRUD
**What goes wrong:** Composite-PK models (ProsedurRowPelaksana, RelatedSOP) use `@@id([a, b])` — the Prisma client API uses compound where arguments instead of single `id`. Implementors in future phases must know this.
**Why it happens:** Different generated client API shape for composite PKs.
**How to avoid:** Use `@@id([field1, field2])` in schema; document that Phase 5+ implementors must use `prisma.prosedurRowPelaksana.findUnique({ where: { prosedurRowId_pelaksanaId: { ... } } })`.

---

## Code Examples

### Deleting Posts Module (Prerequisite Cleanup)

File operations required before schema rewrite:
1. Delete `server/src/modules/posts/` directory
2. Remove `import { PostsModule } from './modules/posts/posts.module';` from `server/src/app.module.ts`
3. Remove `PostsModule` from the `imports: []` array in `app.module.ts`

### Running Migration

```bash
# From server/ directory
npx prisma migrate dev --name init
```

The `prisma.config.ts` file handles schema path and migration path resolution.

### Running Generate Only (after schema changes without migration)

```bash
npx prisma generate
```

### Verifying FK Constraint (FK enforcement test)

```typescript
// In a spec or seed: inserting SOP with nonexistent opdId should throw
await expect(
  prisma.sOP.create({
    data: {
      opdId: 'nonexistent-id',
      judul: 'Test',
      status: 'DRAFT',
      // ...
    }
  })
).rejects.toThrow();
```

### Example: User Model Extension

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      UserRole
  opdId     String?
  nip       String?
  jabatan   String?
  pangkat   String?
  nohp      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  opd             OPD?              @relation(fields: [opdId], references: [id])
  timPenyusun     TimPenyusun[]
  timEvaluasi     TimEvaluasiAnggota[]
  tteProfile      TTEProfile?
  tteSignatures   TTESignature[]
  auditLogs       AuditLog[]
  sopsCreated     SOP[]             @relation("SOPCreatedBy")
  sopsEdited      SOP[]             @relation("SOPLastEditedBy")
  peraturanCreated Peraturan[]
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Prisma `datasource.url` connection string | `@prisma/adapter-mariadb` driver adapter passed to `PrismaClient` constructor | Already implemented in PrismaService — do not revert |
| `previewFeatures = ["driverAdapters"]` | Stable in Prisma 7 — no previewFeatures needed | Check if previewFeatures line in generator causes warnings with v7.5.0 |
| `prisma migrate deploy` for production | `prisma migrate dev` for local development | Phase 1 uses dev; CI/production uses deploy (out of scope for v1.0) |

**Deprecated/outdated:**
- `Post` model: scaffold-only, must be removed before migration
- `posts` relation on `User`: removed with Post model

---

## Open Questions

1. **Komentar table inclusion**
   - What we know: `komentar.ts` exists in client types; listed as "Out of Scope" (real-time chat) in REQUIREMENTS.md
   - What's unclear: Whether a non-realtime komentar feature (simple comment thread on SOP) is needed for v1.0
   - Recommendation: Exclude from Phase 1. If needed later, it's a simple additive migration.

2. **Peraturan → SOP relationship cardinality**
   - What we know: `SOPDaftarItem` has `peraturanId: string` and `peraturan: string` (display name)
   - What's unclear: Is it one Peraturan per SOP, or M:M? `LawBasis` table handles multiple law references as text — `peraturanId` on SOP may be the "primary" peraturan
   - Recommendation: Single FK on SOP (`peraturanId String?`) for the primary peraturan; additional law references go into `LawBasis` table as free text. This is consistent with the separate `LawBasis` table decision.

3. **Prisma 7 previewFeatures for driver adapters**
   - What we know: `@prisma/adapter-mariadb` is at v7.5.0; driver adapters were stabilized in Prisma 5.x
   - What's unclear: Whether `previewFeatures = ["driverAdapters"]` needs to be in the generator block for v7.5.0
   - Recommendation: Do not add `previewFeatures` — stable APIs don't need it. If `prisma generate` warns, add it; if it errors without it, add it.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30 (configured in `server/package.json`) |
| Config file | `package.json` `jest` block (rootDir: src, testRegex: `.*\.spec\.ts$`) |
| Quick run command | `cd server && npx jest --testPathPattern=prisma` |
| Full suite command | `cd server && npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | All 18 tables created after migration | smoke | `cd server && npx prisma migrate dev --name init` (exit code 0 = pass) | N/A — migration run |
| DB-02 | FK constraints enforced (e.g., SOP with invalid opdId rejected) | integration | `cd server && npx jest --testPathPattern=schema.spec` | ❌ Wave 0 |
| DB-03 | Enum fields reject invalid values | integration | `cd server && npx jest --testPathPattern=schema.spec` | ❌ Wave 0 |
| DB-04 | `prisma generate` produces importable client | smoke | `cd server && npx prisma generate && npx tsc --noEmit` | N/A — command run |

### Sampling Rate

- **Per task commit:** `cd server && npx tsc --noEmit` (TypeScript compilation check)
- **Per wave merge:** `cd server && npx jest`
- **Phase gate:** Full suite green + `prisma migrate dev` clean before `/ez:verify-work`

### Wave 0 Gaps

- [ ] `server/src/prisma/schema.spec.ts` — integration test: FK constraint enforcement (DB-02) and enum rejection (DB-03). Requires a test MariaDB instance or mock.
- [ ] Consider whether `@nestjs/testing` + in-memory approach is viable, or whether tests simply run `prisma migrate dev` and verify output. For a pure schema phase, the migration itself IS the test.

*(If test database is unavailable in CI, the acceptance criteria from the phase description serve as the manual verification checklist: `prisma migrate dev` clean, FK constraint error on bad opdId, `prisma generate` importable client)*

---

## Sources

### Primary (HIGH confidence)

- Direct file read: `server/prisma/schema.prisma` — existing datasource, generator, User/Post models confirmed
- Direct file read: `server/src/common/prisma/prisma.service.ts` — `@prisma/adapter-mariadb` usage pattern confirmed
- Direct file read: `server/package.json` — Prisma 7.5.0 versions confirmed
- Direct file read: `server/prisma.config.ts` — migration config path confirmed
- Direct file read: `server/src/app.module.ts` — PostsModule import confirmed (must be removed)
- Direct file read: `client/src/lib/types/*.ts` (all 8 type files) — all enums and table shapes extracted
- Direct file read: `docs/WORKFLOW-SOP.md` — status flow and signing sequence confirmed
- Direct file read: `.planning/phases/01-database-infrastructure/01-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)

- Prisma documentation (known): MariaDB with driver adapter is the supported approach for Prisma 5+/7; `uuid()` is supported in MariaDB 10.3+; self-referential M:M requires explicit join model and named relations
- Prisma documentation (known): `@db.Text` maps to MySQL TEXT column type; composite `@@id` generates compound where args in client

### Tertiary (LOW confidence)

- None — all critical claims verified against project files or well-established Prisma patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed from package.json
- Architecture: HIGH — patterns derived from existing scaffold + Prisma conventions
- Enum inventory: HIGH — extracted verbatim from client TypeScript type files
- Table inventory: HIGH — derived from all 8 client type files + CONTEXT.md table list
- Pitfalls: HIGH — derived from code inspection (PostsModule removal, self-FK patterns) and well-known Prisma MariaDB patterns

**Research date:** 2026-03-25
**Valid until:** 2026-05-01 (Prisma 7.x — stable, changes expected only on minor/patch releases)
