# Phase 1: Database & Infrastructure - Research

**Researched:** 2026-03-25
**Domain:** Prisma 7 schema on MariaDB -- modifications, new models, indexes, cascade rules, seed data
**Confidence:** HIGH

## Summary

Phase 1 completes the data layer for the SOP management system. The existing Prisma schema already has 18 models with correct enum definitions, UUID IDs, and timestamp patterns. The remaining work is a **targeted modification** -- not a rewrite: add new fields to VerifikasiBatch, EvaluasiItem, TTESignature; add two new models (ImplementQualification, Komentar); rename JenisBatch enum values; add indexes on all FK columns; apply cascade/restrict rules; and write a FakerJS seed script. The schema uses `provider = "mysql"` for MariaDB compatibility, which is already configured.

The key risk area is MariaDB's lack of automatic FK indexing (unlike PostgreSQL) and Prisma's limited support for CHECK constraints on MariaDB -- the latter requires raw SQL in the migration file. FakerJS seed must use plaintext passwords since bcrypt hashing belongs to Phase 2.

**Primary recommendation:** Squash existing migrations into a single clean baseline, apply all schema modifications in the Prisma schema file, run `prisma migrate dev` to generate one authoritative migration, then create `prisma/seed.ts` with FakerJS.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Cascade rules:** OPD/User/VerifikasiBatch parents use `Restrict`; SOP children (LawBasis, Equipment, RecordData, ProsedurRow, ImplementQualification) use `Cascade`; ProsedurRow->ProsedurRowPelaksana uses `Cascade`
- **Index strategy:** All FK columns get `@index`; composite `@@index([opdId, status])` on SOP; full FK index list specified in CONTEXT.md
- **Seed data:** FakerJS, independent from client seed JSON, plaintext passwords, scope: all roles + OPD + sample peraturan
- **Evaluasi model:** Two types (TERJADWAL/MANDIRI), both go through BA signing; nilaiOPD only for TERJADWAL; service layer enforces constraint
- **Evaluator open pool:** Remove `timEvaluasiId` from VerifikasiBatch; any Tim Evaluasi member can evaluate any SOP; tracking via `EvaluasiItem.evaluatorId`
- **Riwayat evaluasi:** Append-only EvaluasiItem records (no update-in-place)
- **Schema additions:** +verifiedByUserId, +signedByKoordinatorUserId, +tanggalEvaluasi, +nilaiOPD on VerifikasiBatch; +rekomendasi, +evaluatorId on EvaluasiItem; +sopId, +batchId on TTESignature; new ImplementQualification model; new Komentar model; CHECK constraint for SOP BERLAKU requiring TTESignature
- **Rename JenisBatch:** INISIASI_BIRO -> TERJADWAL, REQUEST_OPD -> MANDIRI
- **Existing patterns kept:** UUID IDs, SOPMetadata merged into SOP, RelatedSOP composite PK, ProsedurRow self-FK named relations, `provider = "mysql"`, `@db.Text` for long text, no blanket soft delete, no kategori SOP field

### Claude's Discretion
- Exact column naming convention (camelCase Prisma fields, `@map` if needed)
- Field ordering within models
- Whether CHECK constraint uses Prisma or raw SQL in migration
- FakerJS seed: number of records per table (minimal enough to verify constraints)
- Komentar model detail fields (beyond those specified)

### Deferred Ideas (OUT OF SCOPE)
- UX Action Clarity (Phase 5-7)
- Dashboard per-role with progress tracking (Phase 5+)
- Notification system (Phase 5+)
- Bulk pengesahan (Phase 7 TTE)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DB-01 | Prisma schema implements all domain tables (count to be updated per new models) | Schema modifications add ImplementQualification + Komentar = 20 models total. Existing 18 models already written. |
| DB-02 | All FK relations, constraints defined correctly in schema | Cascade/Restrict rules fully specified in CONTEXT.md; all FK columns indexed; composite indexes defined |
| DB-03 | Prisma enums for all status fields | 11 enums already exist; JenisBatch values need renaming; HasilEvaluasi may need cleanup (PERLU_PERBAIKAN unused per workflow) |
| DB-04 | Migration runs clean on empty MariaDB database | Squash existing 2 migrations into single baseline; apply modifications; test `prisma migrate dev --name init` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prisma | ^7.5.0 | Schema definition, migration, client generation | Already installed; MariaDB adapter included |
| @prisma/client | ^7.5.0 | Type-safe database queries | Already installed and configured |
| @prisma/adapter-mariadb | ^7.5.0 | MariaDB driver adapter for Prisma | Already installed for MariaDB compatibility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @faker-js/faker | ^9.x | Generate realistic seed data | Seed script for all domain tables |
| ts-node | ^10.9.2 | Execute seed.ts directly | Already installed; used by `prisma db seed` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FakerJS | Manual JSON seed | FakerJS generates varied data faster; user locked this decision |
| Single migration squash | Keep existing 2 migrations | Squash gives cleaner baseline for Phase 1 completion |

**Installation:**
```bash
cd server && npm install --save-dev @faker-js/faker
```

Note: `@faker-js/faker` is dev-only since seed data is not needed in production.

## Architecture Patterns

### Recommended Project Structure
```
server/
├── prisma/
│   ├── schema.prisma          # All models, enums, relations, indexes
│   ├── seed.ts                # FakerJS seed script
│   └── migrations/
│       └── YYYYMMDD_init/     # Single squashed migration
├── src/
│   ├── generated/prisma/      # Generated Prisma client (output path)
│   └── common/prisma/
│       └── prisma.service.ts  # Global PrismaService (already exists)
```

### Pattern 1: Schema Modification (Not Rewrite)
**What:** The existing 18-model schema is already written and validated. This phase applies targeted modifications.
**When to use:** When base schema exists and needs additions/changes.
**Approach:**
1. Modify `schema.prisma` in-place (add fields, models, indexes, cascade rules)
2. Delete existing migration directories
3. Run `prisma migrate dev --name init` for single clean baseline
4. Run `prisma generate` to update typed client

### Pattern 2: Cascade/Restrict Rule Application
**What:** Apply `onDelete` and `onUpdate` rules to all `@relation` decorators.
**Rules from CONTEXT.md:**
```prisma
// RESTRICT pattern (parent cannot be deleted if children exist)
opd OPD @relation(fields: [opdId], references: [id], onDelete: Restrict)

// CASCADE pattern (children deleted with parent)
sop SOP @relation(fields: [sopId], references: [id], onDelete: Cascade)
```

### Pattern 3: FK Index Pattern for MariaDB
**What:** MariaDB does not auto-create indexes on FK columns (PostgreSQL does). Every FK column needs an explicit `@@index`.
**Example:**
```prisma
model SOP {
  opdId String
  // ... other fields

  @@index([opdId, status])  // Composite index for most common query
  @@index([peraturanId])
  @@index([createdById])
  @@index([lastEditedById])
  @@index([picUserId])
}
```

### Pattern 4: New Model Pattern (ImplementQualification, Komentar)
**What:** Follow established pattern: UUID id, sopId FK, `@db.Text` for content, cascade from SOP.
**Example:**
```prisma
model ImplementQualification {
  id    String @id @default(uuid())
  sopId String
  text  String @db.Text

  sop SOP @relation(fields: [sopId], references: [id], onDelete: Cascade)

  @@index([sopId])
}

model Komentar {
  id        String         @id @default(uuid())
  sopId     String
  userId    String
  role      String         // KomentarRoleLabel snapshot at comment time
  isi       String         @db.Text
  bagian    String?        // Section of SOP being commented on
  status    KomentarStatus @default(OPEN)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  sop  SOP  @relation(fields: [sopId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([sopId])
  @@index([userId])
}
```

New enum needed:
```prisma
enum KomentarStatus {
  OPEN
  RESOLVED
}
```

### Pattern 5: FakerJS Seed Script
**What:** Seed script that creates interconnected data matching all FK constraints.
**Order matters** -- must seed in dependency order:
1. OPD (no deps)
2. Users (depends on OPD)
3. Peraturan (depends on User)
4. Tim Penyusun / Tim Evaluasi (depends on User + OPD)
5. Pelaksana (depends on OPD)
6. SOP (depends on OPD, User, Peraturan)
7. SOP children: LawBasis, Equipment, RecordData, ImplementQualification, ProsedurRow
8. ProsedurRowPelaksana (depends on ProsedurRow + Pelaksana)
9. VerifikasiBatch (depends on OPD)
10. EvaluasiItem (depends on VerifikasiBatch + SOP + User)
11. AuditLog (depends on SOP + User)
12. TTEProfile, TTESignature (depends on User)
13. Komentar (depends on SOP + User)

**Seed config in package.json:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Anti-Patterns to Avoid
- **Rewriting the entire schema:** The existing 18 models are already validated. Only modify what CONTEXT.md specifies.
- **Keeping old migrations alongside new changes:** Squash to single baseline for DB-04 (clean migration on empty DB).
- **Adding indexes inside the model block:** Prisma uses `@@index` at the bottom of the model block, not inline with field definitions.
- **Using `@default(autoincrement())` for IDs:** Project uses UUID `@default(uuid())` everywhere -- do not break this pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom UUID function | Prisma `@default(uuid())` | Already the established pattern |
| Timestamp management | Manual date fields | Prisma `@default(now())` + `@updatedAt` | Automatic, consistent |
| Seed data generation | Manual JSON objects | FakerJS `faker.person.fullName()`, etc. | Generates realistic varied data |
| Migration management | Raw SQL files | `prisma migrate dev` | Tracks schema drift, generates typed client |
| CHECK constraints | Prisma-level validation | Raw SQL in migration file | Prisma does not support CHECK constraints natively on MySQL/MariaDB |

**Key insight:** Prisma handles the heavy lifting for schema, migration, and client generation. The only manual SQL needed is for the CHECK constraint (SOP BERLAKU must have TTESignature).

## Common Pitfalls

### Pitfall 1: MariaDB FK Index Gap
**What goes wrong:** Queries on FK columns are slow because MariaDB does not auto-create indexes.
**Why it happens:** PostgreSQL creates indexes automatically for FKs; MariaDB does not.
**How to avoid:** Add explicit `@@index([fkColumn])` for every FK column as specified in CONTEXT.md.
**Warning signs:** Slow queries on joins or WHERE clauses filtering by FK columns.

### Pitfall 2: Prisma Enum Rename is Destructive
**What goes wrong:** Renaming JenisBatch values (INISIASI_BIRO -> TERJADWAL, REQUEST_OPD -> MANDIRI) may cause data loss if existing data exists.
**Why it happens:** Prisma treats enum value renames as drop+recreate.
**How to avoid:** Since we are squashing to a single clean migration on an empty database, this is safe. The enum just needs the new values from the start. If there were existing production data, a two-step migration would be needed.
**Warning signs:** Migration warnings about data loss on enum columns.

### Pitfall 3: Self-Referential FK Ambiguity in Prisma
**What goes wrong:** ProsedurRow has two self-referential FKs (nextStepYesId, nextStepNoId) which causes Prisma validation errors.
**Why it happens:** Prisma cannot disambiguate multiple relations to the same model without named relations.
**How to avoid:** Already solved with named relations "YesStep" and "NoStep" -- do not remove these.
**Warning signs:** `Error validating: Ambiguous relation detected`.

### Pitfall 4: CHECK Constraint Not Supported in Prisma Schema
**What goes wrong:** Attempting to add `CHECK (status = 'BERLAKU' IMPLIES EXISTS TTESignature)` in schema.prisma.
**Why it happens:** Prisma does not support CHECK constraints in its schema language for MySQL/MariaDB.
**How to avoid:** Add raw SQL in the migration file after `prisma migrate dev` generates it, OR create a separate migration with `prisma migrate dev --create-only` and add the CHECK manually.
**Warning signs:** Schema validation errors if trying to use `@@check` (not a valid Prisma attribute for MySQL).

### Pitfall 5: Seed Script Dependency Order
**What goes wrong:** Foreign key constraint violations during seeding.
**Why it happens:** Creating child records before parent records exist.
**How to avoid:** Seed in strict dependency order (OPD -> User -> Peraturan -> SOP -> children). Use `prisma.$transaction` for atomicity.
**Warning signs:** `Foreign key constraint failed` errors during seed.

### Pitfall 6: `onDelete: Cascade` on ProsedurRowPelaksana Join Table
**What goes wrong:** Deleting a ProsedurRow should cascade to its join entries, but deleting a Pelaksana should not cascade (it might be referenced elsewhere).
**Why it happens:** Both sides of M:M join need different cascade behavior.
**How to avoid:** ProsedurRowPelaksana: `prosedurRow` FK uses `onDelete: Cascade`; `pelaksana` FK uses `onDelete: Restrict`.

### Pitfall 7: TimEvaluasiAnggota Orphaned Relation
**What goes wrong:** The existing schema has `verifikasiBatch VerifikasiBatch[]` on TimEvaluasiAnggota, but CONTEXT.md says to REMOVE `timEvaluasiId` from VerifikasiBatch.
**Why it happens:** The evaluator open-pool decision makes the old FK relationship obsolete.
**How to avoid:** Remove both the `timEvaluasiId` field from VerifikasiBatch AND the `verifikasiBatch` relation from TimEvaluasiAnggota.

## Code Examples

### Schema Modification: VerifikasiBatch (additions + removals)
```prisma
model VerifikasiBatch {
  id                        String         @id @default(uuid())
  opdId                     String
  jenis                     JenisBatch
  status                    StatusEvaluasi @default(AKTIF)
  catatan                   String?        @db.Text
  nomorBA                   String?
  // REMOVED: timEvaluasiId -- evaluator open pool
  tanggalRequest            DateTime?
  tanggalEvaluasi           DateTime?      // NEW: from client type
  nilaiOPD                  Int?           // NEW: 1-5 Likert, only TERJADWAL
  verifiedByUserId          String?        // NEW: Biro user who verified BA
  signedByKoordinatorUserId String?        // NEW: Koordinator who signed BA
  isSignedByKoordinator     Boolean        @default(false)
  tanggalTTDBaByKoordinator DateTime?
  createdAt                 DateTime       @default(now())
  updatedAt                 DateTime       @updatedAt

  opd                    OPD    @relation(fields: [opdId], references: [id], onDelete: Restrict)
  verifiedByUser         User?  @relation("BatchVerifiedBy", fields: [verifiedByUserId], references: [id], onDelete: Restrict)
  signedByKoordinatorUser User? @relation("BatchSignedByKoordinator", fields: [signedByKoordinatorUserId], references: [id], onDelete: Restrict)
  evaluasiItems          EvaluasiItem[]

  @@index([opdId])
  @@index([verifiedByUserId])
  @@index([signedByKoordinatorUserId])
}
```

### Schema Modification: EvaluasiItem (additions)
```prisma
model EvaluasiItem {
  id          String         @id @default(uuid())
  batchId     String
  sopId       String
  evaluatorId String         // NEW: FK to User
  hasil       HasilEvaluasi?
  catatan     String?        @db.Text
  rekomendasi String?        @db.Text  // NEW: from client SOPItem type
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  batch     VerifikasiBatch @relation(fields: [batchId], references: [id], onDelete: Restrict)
  sop       SOP             @relation(fields: [sopId], references: [id], onDelete: Restrict)
  evaluator User            @relation("EvaluasiEvaluator", fields: [evaluatorId], references: [id], onDelete: Restrict)

  @@index([batchId])
  @@index([sopId])
  @@index([evaluatorId])
}
```

### Schema Modification: TTESignature (additions)
```prisma
model TTESignature {
  id            String   @id @default(uuid())
  userId        String
  role          TTERole
  documentId    String
  documentLabel String
  referenceId   String
  documentHash  String
  sopId         String?  // NEW: explicit FK for per-SOP TTE audit
  batchId       String?  // NEW: explicit FK for per-BA TTE audit
  signedAt      DateTime @default(now())

  user  User             @relation(fields: [userId], references: [id], onDelete: Restrict)
  sop   SOP?             @relation(fields: [sopId], references: [id], onDelete: Restrict)
  batch VerifikasiBatch?  @relation(fields: [batchId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@index([sopId])
  @@index([batchId])
}
```

### FakerJS Seed Script Structure
```typescript
// server/prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma';
import { faker } from '@faker-js/faker/locale/id_ID'; // Indonesian locale

const prisma = new PrismaClient();

async function main() {
  // 1. Seed OPDs (3-5 OPDs)
  const opds = await Promise.all(
    Array.from({ length: 4 }, () =>
      prisma.oPD.create({
        data: {
          name: faker.company.name(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          kode: faker.string.alpha({ length: 3, casing: 'upper' }),
        },
      })
    )
  );

  // 2. Seed Users per role (2-3 per role per OPD)
  // ... passwords as plaintext (Phase 2 adds hashing)

  // 3. Seed downstream tables in FK dependency order
  // ...
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Raw SQL for CHECK Constraint
```sql
-- Add after Prisma migration generates the base DDL
-- This enforces that SOP with status BERLAKU must have a TTESignature
-- NOTE: MariaDB CHECK constraints are evaluated per-row on INSERT/UPDATE
-- A cross-table CHECK is NOT directly possible in MariaDB.
-- Use a TRIGGER instead:

DELIMITER $$
CREATE TRIGGER check_sop_berlaku_has_tte
BEFORE UPDATE ON `SOP`
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' THEN
    IF NOT EXISTS (
      SELECT 1 FROM `TTESignature` WHERE `sopId` = NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SOP cannot be set to BERLAKU without a TTESignature';
    END IF;
  END IF;
END$$
DELIMITER ;
```

**Note:** MariaDB CHECK constraints cannot reference other tables. A BEFORE UPDATE trigger is the correct approach for cross-table validation. This should be added as raw SQL in the migration file.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma 5/6 with `prisma-client-js` only | Prisma 7 with driver adapters (`@prisma/adapter-mariadb`) | Prisma 7.x | Native MariaDB support via adapter |
| `@@map` / `@map` required for snake_case DB columns | camelCase Prisma fields map directly (MySQL default) | Prisma 4+ | Less boilerplate in schema |
| Manual enum sync between Prisma and TypeScript | Generated Prisma client exports enums directly | Prisma 2+ | Import from `@prisma/client` or generated path |

**Deprecated/outdated:**
- `experimentalFeatures` for referential actions: Now stable in Prisma 4+ -- `onDelete`/`onUpdate` work without feature flags
- `@prisma/engines` manual downloads: Prisma 7 handles engine management automatically

## Open Questions

1. **HasilEvaluasi enum: keep or remove PERLU_PERBAIKAN?**
   - What we know: CONTEXT.md specifics mention workflow only uses SESUAI and REVISI_BIRO. Current schema has 3 values: SESUAI, PERLU_PERBAIKAN, REVISI_BIRO.
   - What's unclear: Whether PERLU_PERBAIKAN has any remaining use case or was an earlier design artifact.
   - Recommendation: Remove PERLU_PERBAIKAN since the workflow explicitly maps to only SESUAI and REVISI_BIRO. The CONTEXT.md specifics section raised this question but the locked decisions do not override it. Planner should decide based on workflow doc.

2. **Cross-table CHECK constraint feasibility**
   - What we know: MariaDB CHECK constraints cannot reference other tables. A trigger is needed.
   - What's unclear: Whether the trigger approach is acceptable or if this validation should be service-layer only.
   - Recommendation: Implement as a BEFORE UPDATE trigger in the migration file (double protection per CONTEXT.md decision). Service layer is primary enforcement.

3. **Migration squash strategy**
   - What we know: Two existing migrations exist (init + normalization_3nf). Schema modifications will change many models.
   - What's unclear: Whether to keep existing migrations and add a third, or squash all into one baseline.
   - Recommendation: Squash into single clean migration since DB-04 requires clean migration on empty DB and there is no production data to preserve.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest |
| Config file | `server/package.json` (jest section) |
| Quick run command | `cd server && npx jest --testPathPattern=prisma --passWithNoTests -x` |
| Full suite command | `cd server && npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | All domain tables exist in schema | smoke | `cd server && npx prisma validate` | N/A (CLI) |
| DB-02 | FK relations and constraints correct | smoke | `cd server && npx prisma validate` | N/A (CLI) |
| DB-03 | All enums defined | smoke | `cd server && npx prisma validate` | N/A (CLI) |
| DB-04 | Migration runs clean on empty DB | integration | `cd server && npx prisma migrate dev --name test-clean` | N/A (CLI) |
| DB-SEED | Seed data populates all tables without FK violations | integration | `cd server && npx prisma db seed` | Wave 0: `server/prisma/seed.ts` |

### Sampling Rate
- **Per task commit:** `cd server && npx prisma validate && npx prisma generate`
- **Per wave merge:** `cd server && npx prisma migrate dev --name verify && npx prisma db seed`
- **Phase gate:** Migration + seed run clean on empty MariaDB; `prisma validate` passes

### Wave 0 Gaps
- [ ] `server/prisma/seed.ts` -- FakerJS seed script (to be created)
- [ ] `@faker-js/faker` dev dependency -- needs `npm install --save-dev @faker-js/faker`
- [ ] `prisma.seed` config in `server/package.json` -- needs adding

*(No additional test files needed -- Prisma CLI commands serve as the validation mechanism for schema phases)*

## Sources

### Primary (HIGH confidence)
- `server/prisma/schema.prisma` -- existing 18-model schema (read directly)
- `server/package.json` -- Prisma 7.5.0, ts-node, Jest 30 confirmed
- `.planning/phases/01-database-infrastructure/01-CONTEXT.md` -- all locked decisions
- `.planning/PROJECT.md` -- 3NF normalization rules, BA workflow constraints
- `client/src/lib/types/verifikasi-batch.ts` -- VerifikasiBatch fields verified
- `client/src/lib/types/komentar.ts` -- Komentar fields verified (KomentarStatus: open/resolved)
- `client/src/lib/types/audit.ts` -- AuditAction 11 values verified

### Secondary (MEDIUM confidence)
- Prisma 7 MariaDB adapter support -- based on installed `@prisma/adapter-mariadb` package
- FakerJS Indonesian locale (`id_ID`) availability -- standard in @faker-js/faker

### Tertiary (LOW confidence)
- MariaDB BEFORE UPDATE trigger syntax for cross-table validation -- needs testing on actual MariaDB instance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed and configured; versions verified from package.json
- Architecture: HIGH -- schema patterns already established in existing 18 models; modifications are additive
- Pitfalls: HIGH -- MariaDB FK index gap is well-documented; Prisma CHECK constraint limitation is known; cascade rules fully specified
- Seed strategy: MEDIUM -- FakerJS Indonesian locale needs verification; dependency order derived from schema analysis

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- Prisma 7 and MariaDB are established)
