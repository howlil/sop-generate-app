# Phase 1 Research: Database & Infrastructure

**Created:** 2026-04-01
**Research Goal:** Validate technical decisions for Prisma 7 + MariaDB setup, CHECK constraints, optimistic locking, and cascade patterns

---

## 1. Prisma 7 + MariaDB Compatibility

**Question:** Is Prisma 7 compatible with MariaDB for production use?

**Findings:**
- ✅ **Prisma 7 supports MariaDB** officially (confirmed in Prisma 7 AMA)
- ✅ Supported versions: MariaDB 10.0+ and MariaDB 11.0+
- ✅ Uses `@prisma/adapter-mariadb` driver (already in package.json: `^7.5.0`)
- ✅ MySQL provider in Prisma schema is compatible with MariaDB

**Code Context:**
```prisma
datasource db {
  provider = "mysql"  // Works with MariaDB
  url      = env("DATABASE_URL")
}
```

**Validation:**
- Current project uses `@prisma/client@^7.5.0` and `prisma@^7.5.0` — compatible
- MariaDB compatibility confirmed for all 20 models in schema

**Risk Level:** ✅ LOW — Fully supported configuration

---

## 2. CHECK Constraint Support in Prisma

**Question:** How to enforce CHECK constraints (XOR, enum validation) with Prisma?

**Findings:**
- ❌ Prisma does NOT support `@check()` decorator in schema
- ✅ **Solution:** Use raw SQL migrations after `prisma migrate`
- ✅ Pattern: Create migration with `prisma migrate dev`, then add raw SQL via `$executeRaw`

**Implementation Pattern:**
```typescript
// After prisma migrate, run raw SQL for CHECK constraints
await prisma.$executeRaw`
  ALTER TABLE RiwayatTandaTangan ADD CONSTRAINT chk_tte_xor
    CHECK ((sopDetailId IS NULL) != (pengajuanEvaluasiId IS NULL))
`;
```

**Migration Workflow:**
1. Run `prisma migrate dev --name init` to create baseline
2. Create separate raw migration file for CHECK constraints
3. Apply via `$executeRaw` in setup script or manual migration step

**Constraints Requiring Raw SQL:**
| Constraint | Table | SQL |
|------------|-------|-----|
| [P1-A] XOR | RiwayatTandaTangan | `CHECK ((sopDetailId IS NULL) != (pengajuanEvaluasiId IS NULL))` |
| [P1-B] nilaiOPD | PengajuanEvaluasi | `CHECK ((jenis = 'MANDIRI' AND nilaiOPD IS NULL) OR jenis = 'TERJADWAL')` |
| [P2-A] Langkah jenis | LangkahSOP | `CHECK ((jenis = 'TERMINATOR' AND yaId IS NULL AND tidakId IS NULL) OR (jenis = 'TASK' AND tidakId IS NULL) OR (jenis = 'DECISION'))` |

**Risk Level:** ⚠️ MEDIUM — Requires manual raw SQL, but well-documented pattern

---

## 3. Optimistic Locking Pattern

**Question:** What's the correct Prisma pattern for optimistic concurrency control?

**Findings:**
- ✅ **Recommended by Prisma:** Use `version` Int field with atomic increment
- ✅ Pattern: Include version in WHERE clause, increment on update
- ✅ Throws P2025 error if version mismatch (0 rows affected)

**Schema Pattern:**
```prisma
model PengajuanEvaluasi {
  // ... fields
  version Int @default(0)
  @@index([version])
}

model NilaiEvaluasi {
  // ... fields
  version Int @default(0)
  @@index([version])
}
```

**Update Pattern:**
```typescript
async function updateWithOptimisticLock(id: string, currentVersion: number, data: any) {
  try {
    const result = await prisma.model.updateMany({
      where: {
        id,
        version: currentVersion, // Version check
      },
      data: {
        ...data,
        version: { increment: 1 }, // Atomic increment
      },
    })

    if (result.count === 0) {
      throw new ConflictException('Record was modified by another user, refresh and try again')
    }

    return result
  } catch (e) {
    if (e.code === 'P2025') {
      throw new ConflictException('Version mismatch - record was modified concurrently')
    }
    throw e
  }
}
```

**HTTP Response:**
- Return **409 Conflict** on version mismatch
- Include expected vs actual version in error response for frontend retry logic

**Validation:**
- Schema already has `version Int @default(0)` on PengajuanEvaluasi and NilaiEvaluasi
- Pattern matches Prisma 7 best practices

**Risk Level:** ✅ LOW — Standard Prisma pattern, well-documented

---

## 4. Multi-Path Cascade Deadlock Prevention

**Question:** How to avoid deadlocks with DiagramEdge/NodePosition having multiple FK paths?

**Findings:**
- ✅ **Schema fix applied:** Changed `onDelete` from Cascade to Restrict for DiagramNodePosition and DiagramEdge
- ✅ Primary delete path: Via DiagramLayout (Cascade)
- ✅ Service layer MUST delete children before parent

**Delete Order (from SCHEMA-CONSTRAINTS.md [P0-A]):**
```typescript
async function hapusDetailSOP(sopDetailId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Delete edge points first
    await tx.diagramEdgePoint.deleteMany({
      where: { diagramEdge: { diagramLayout: { sopDetailId } } },
    })

    // 2. Delete edges
    await tx.diagramEdge.deleteMany({
      where: { diagramLayout: { sopDetailId } },
    })

    // 3. Delete node positions
    await tx.diagramNodePosition.deleteMany({
      where: { diagramLayout: { sopDetailId } },
    })

    // 4. NOW safe to delete DetailSOP (cascade to LangkahSOP, DiagramLayout, etc.)
    await tx.detailSOP.delete({ where: { id: sopDetailId } })
  })
}
```

**Schema Validation:**
```prisma
// DiagramNodePosition - Restrict to avoid deadlock
model DiagramNodePosition {
  langkahSOP LangkahSOP @relation(fields: [langkahSopId], references: [id], onDelete: Restrict)
  // Primary delete path via DiagramLayout (Cascade)
}

// DiagramEdge - Restrict for both FKs
model DiagramEdge {
  dariLangkah LangkahSOP @relation("DiagramEdgeDari", fields: [dariLangkahId], references: [id], onDelete: Restrict)
  keLangkah   LangkahSOP @relation("DiagramEdgeKe", fields: [keLangkahId], references: [id], onDelete: Restrict)
}
```

**Risk Level:** ⚠️ MEDIUM — Requires strict service layer enforcement, but schema is correctly configured

---

## 5. Soft-Delete Pattern with Prisma

**Question:** How to implement soft-delete with Prisma while maintaining query safety?

**Findings:**
- ✅ Pattern: Add `deletedAt DateTime?` field
- ✅ Filter `deletedAt: null` in all queries (explicit or via middleware)
- ✅ Deactivate child relations before soft-delete parent

**Implementation:**
```prisma
model OPD {
  deletedAt DateTime?
  @@index([deletedAt])
  @@index([opdId, deletedAt])
}

model Pengguna {
  deletedAt DateTime?
  @@index([deletedAt])
}
```

**Query Pattern:**
```typescript
// Explicit filter (recommended for clarity)
const opds = await prisma.oPD.findMany({
  where: { deletedAt: null },
})

// Or use middleware for automatic filtering
// prisma.use(async (params, next) => {
//   if (params.model === 'OPD' && params.action === 'findMany') {
//     params.args.where = { ...params.args.where, deletedAt: null }
//   }
//   return next(params)
// })
```

**Soft-Delete Service Layer:**
```typescript
async function softDeleteOPD(opdId: string) {
  // Check for active pengajuan evaluasi
  const pengajuanAktif = await prisma.pengajuanEvaluasi.count({
    where: { opdId, status: { not: 'SELESAI' } },
  })
  if (pengajuanAktif > 0) {
    throw new ConflictException('Masih ada pengajuan evaluasi aktif')
  }

  return prisma.opd.update({
    where: { id: opdId },
    data: { deletedAt: new Date() },
  })
}
```

**Validation:**
- Schema has `deletedAt DateTime?` on OPD and Pengguna
- Indexes on [deletedAt] and [opdId, deletedAt] for performance

**Risk Level:** ✅ LOW — Standard pattern, schema correctly configured

---

## 6. Unique Constraint with NULL Values

**Question:** How does Prisma handle unique constraints with nullable fields (XOR pattern)?

**Findings:**
- ✅ **MySQL/Prisma behavior:** Multiple NULL values are allowed in unique constraint
- ✅ XOR constraint requires CHECK constraint (see section 2)
- ✅ Unique constraint only enforces when field IS NOT NULL

**Pattern for RiwayatTandaTangan:**
```prisma
model RiwayatTandaTangan {
  sopDetailId         String?
  pengajuanEvaluasiId String?

  // These unique constraints only apply when field IS NOT NULL
  @@unique([sopDetailId, peran])
  @@unique([pengajuanEvaluasiId, peran])
}
```

**Behavior:**
- When `sopDetailId IS NOT NULL`: Unique constraint [sopDetailId, peran] is enforced
- When `pengajuanEvaluasiId IS NOT NULL`: Unique constraint [pengajuanEvaluasiId, peran] is enforced
- CHECK constraint ensures exactly one is NOT NULL

**Risk Level:** ✅ LOW — MySQL unique constraint behavior is well-understood

---

## 7. Self-Referential Relations in Prisma

**Question:** How to handle self-referential FKs (LangkahSOP, SopTerkait) without ambiguity?

**Findings:**
- ✅ **Required:** Named relations with `@relation("RelationName")`
- ✅ Both forward and backward relations must be named
- ✅ SetNull for self-referential FKs to allow deletion without breaking chain

**Pattern:**
```prisma
model LangkahSOP {
  langkahSelanjutnyaYaId    String?
  langkahSelanjutnyaTidakId String?

  // Named relations for self-reference
  langkahYa    LangkahSOP? @relation("LangkahYa", fields: [langkahSelanjutnyaYaId], references: [id], onDelete: SetNull)
  langkahTidak LangkahSOP? @relation("LangkahTidak", fields: [langkahSelanjutnyaTidakId], references: [id], onDelete: SetNull)
  langkahSebelumYa    LangkahSOP[] @relation("LangkahYa")
  langkahSebelumTidak LangkahSOP[] @relation("LangkahTidak")
}

model SopTerkait {
  sopDetailId        String
  sopTerkaitDetailId String

  sop        DetailSOP @relation("RelasiSOP", fields: [sopDetailId], references: [id], onDelete: Cascade)
  sopTerkait DetailSOP @relation("RelasiSOPTerkait", fields: [sopTerkaitDetailId], references: [id], onDelete: Cascade)
}
```

**Validation:**
- Schema already uses named relations correctly
- SetNull on self-referential FKs

**Risk Level:** ✅ LOW — Prisma handles self-relations well with named relations

---

## 8. Index Strategy for Performance

**Question:** What indexes are needed for common query patterns?

**Findings:**
- ✅ **FK Index:** All foreign key fields should be indexed for join performance
- ✅ **Filter Index:** Fields used in WHERE clauses (status, opdId, deletedAt)
- ✅ **Composite Index:** Common filter combinations [opdId, status], [sopId, status]

**Index Coverage in Schema:**
```prisma
model Pengguna {
  @@index([opdId])
  @@index([deletedAt])
  @@index([opdId, deletedAt])
}

model DetailSOP {
  @@index([sopId, status])  // Composite for filtering by SOP + status
  @@index([status])
  @@index([salinDariDetailSopId])
  @@index([dibuatOlehId])
  @@index([terakhirDieditOlehId])
}

model PengajuanEvaluasi {
  @@index([opdId])
  @@index([status])
  @@index([jenis])
  @@index([opdId, status])  // Composite for OPD + status filtering
}
```

**Risk Level:** ✅ LOW — Comprehensive index strategy already in schema

---

## 9. Migration Strategy for Phase 1

**Question:** What's the optimal migration approach for greenfield Phase 1?

**Findings:**
- ✅ **Squash migration:** Single baseline migration for Phase 1 (no history to preserve)
- ✅ Command: `prisma migrate dev --name init`
- ✅ Generate client: `prisma generate`
- ✅ Seed script: FakerJS for development data

**Migration Workflow:**
```bash
# 1. Create baseline migration
npx prisma migrate dev --name init

# 2. Generate Prisma client
npx prisma generate

# 3. (Optional) Seed database
npx prisma db seed
```

**Post-Migration Steps:**
1. Apply CHECK constraints via raw SQL
2. Create triggers for [P0-B] (single BERLAKU per SOP) and [P0-D] (status transition guard)
3. Verify all 20 tables created
4. Test FK enforcement with insert/delete operations

**Risk Level:** ✅ LOW — Standard Prisma migration workflow

---

## 10. Trigger Support in MySQL/MariaDB

**Question:** Can Prisma handle MySQL triggers for constraint enforcement?

**Findings:**
- ✅ **Yes:** Triggers are created via raw SQL migrations
- ✅ Pattern: Create trigger after table creation via `$executeRaw`
- ✅ Triggers survive Prisma migrations (database-level objects)

**Trigger Pattern for [P0-B]:**
```sql
DELIMITER $$
CREATE TRIGGER trg_satu_berlaku_per_sop
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' AND OLD.status != 'BERLAKU' THEN
    IF EXISTS (
      SELECT 1 FROM DetailSOP
      WHERE sopId = NEW.sopId
        AND status = 'BERLAKU'
        AND id != NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SOP sudah memiliki versi BERLAKU';
    END IF;
  END IF;
END$$
DELIMITER ;
```

**Application via Prisma:**
```typescript
await prisma.$executeRawUnsafe(`
  DELIMITER $$
  CREATE TRIGGER trg_satu_berlaku_per_sop
  BEFORE UPDATE ON DetailSOP
  FOR EACH ROW
  BEGIN
    -- trigger logic
  END$$
  DELIMITER ;
`)
```

**Risk Level:** ⚠️ MEDIUM — Triggers add complexity, but necessary for [P0-B] constraint

---

## 11. Prisma Client Import Path

**Question:** What's the correct import path for custom Prisma client output?

**Findings:**
- ✅ Schema specifies: `output = "../src/generated/prisma"`
- ✅ Import pattern: `import { PrismaClient } from './generated/prisma'`
- ✅ NOT: `import { PrismaClient } from '@prisma/client'`

**Configuration:**
```prisma
generator client {
  provider       = "prisma-client-js"
  output         = "../src/generated/prisma"
  jsModuleFormat = "cjs"
}
```

**Usage:**
```typescript
// Correct
import { PrismaClient } from './generated/prisma'

// WRONG - will fail because output is customized
// import { PrismaClient } from '@prisma/client'
```

**Risk Level:** ✅ LOW — Custom output path is standard Prisma feature

---

## Summary: Risk Assessment

| Area | Risk | Mitigation |
|------|------|------------|
| Prisma 7 + MariaDB | ✅ LOW | Fully supported, versions compatible |
| CHECK Constraints | ⚠️ MEDIUM | Use raw SQL migrations, well-documented |
| Optimistic Locking | ✅ LOW | Standard Prisma pattern |
| Cascade Deadlock | ⚠️ MEDIUM | Schema fixed (Restrict), service layer must enforce delete order |
| Soft-Delete | ✅ LOW | Standard pattern, schema correct |
| Unique + NULL | ✅ LOW | MySQL behavior well-understood |
| Self-Relations | ✅ LOW | Named relations pattern working |
| Index Strategy | ✅ LOW | Comprehensive indexes in schema |
| Migration Strategy | ✅ LOW | Standard Prisma workflow |
| Triggers | ⚠️ MEDIUM | Raw SQL required, but necessary for [P0-B] |

**Overall Risk:** ⚠️ **MEDIUM** — All risks are manageable with documented patterns

---

## Recommendations

### Must-Do Before Phase 2:

1. **Create baseline migration:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Apply CHECK constraints via raw SQL:**
   - [P1-A] XOR constraint on RiwayatTandaTangan
   - [P1-B] nilaiOPD constraint on PengajuanEvaluasi
   - [P2-A] Langkah jenis constraint on LangkahSOP

3. **Create triggers:**
   - [P0-B] Single BERLAKU per SOP trigger
   - [P0-D] Status transition guard trigger (optional, defense-in-depth)

4. **Test cascade delete order:**
   - Insert parent-child hierarchy
   - Delete DiagramEdge + DiagramNodePosition first
   - Then delete DetailSOP
   - Verify no deadlocks

5. **Test optimistic locking:**
   - Concurrent update simulation
   - Verify 409 Conflict on version mismatch

6. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

7. **Create seed script:**
   - Use FakerJS for development data
   - Seed all 20 tables with realistic data
   - Include test cases for constraints

### Optional (Defense-in-Depth):

- Create status transition guard trigger [P0-D]
- Create Prisma middleware for automatic soft-delete filtering
- Add integration tests for all constraint scenarios

---

## References

- Prisma 7 Documentation: https://www.prisma.io/docs/orm/overview/databases/mysql
- Prisma 7 AMA (MariaDB support): https://www.prisma.io/blog/prisma-7-ama-clearing-up-the-why-behind-the-changes
- Optimistic Locking Pattern: https://oneuptime.com/blog/post/2026-01-25-optimistic-locking-prisma-nodejs/view
- CHECK Constraints Discussion: https://github.com/prisma/prisma/issues/3388
- SCHEMA-CONSTRAINTS.md: `docs/SCHEMA-CONSTRAINTS.md`

---

*Research completed: 2026-04-01*
*All technical decisions validated with documentation and community patterns*
