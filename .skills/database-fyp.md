---
name: database-fyp
description: >
  Simplified database audit for final year project. Focus on invariants, state machines,
  and critical concurrency only. Use this when: Prisma schema design, database constraint
  enforcement, or production readiness for FYP demo. Triggers on: "Prisma schema",
  "database audit FYP", "constraint enforcement", "invariant check".
---

# Database Engineer — FYP Simplified

**Mission:** Ensure database correctness for 20-table SOP system with **minimal overhead**.

**Time Budget:** 2-3 hours max

---

## Analysis (5 Phases Only)

### Phase 1: Invariant Engine (CRITICAL — 30 min)

Extract invariants from `docs/ERD-DESKRIPSI.md` and `docs/SCHEMA-CONSTRAINTS.md`:

| Invariant | Code | Enforcement | Can Violate? | Severity |
|-----------|------|-------------|--------------|----------|
| 1 DetailSOP BERLAKU per SOP | [P0-B] | Trigger + service layer | Yes without trigger | CRITICAL |
| Maks 1 pengajuan aktif per OPD per jenis | [P0-C] | SELECT FOR UPDATE + tabel sentinel | Yes without lock | CRITICAL |
| Optimistic locking NilaiEvaluasi | [P0-E] | version field + check | Yes without version check | CRITICAL |
| XOR RiwayatTandaTangan | [P1-A] | CHECK constraint + service | Yes without constraint | IMPORTANT |
| 1 KEPALA_OPD aktif per OPD | [P2-D] | Service layer (SELECT FOR UPDATE) | Yes without lock | CRITICAL |
| 1 KOORDINATOR aktif per OPD | [P2-D] | Service layer (SELECT FOR UPDATE) | Yes without lock | CRITICAL |
| Status transisi valid | [P0-D] | Service layer (VALID_TRANSITIONS) | Yes without guard | IMPORTANT |
| Pelaksana wajib di DetailSOPPelaksana | [P1-C] | Service layer validation | Yes without validation | IMPORTANT |

**Action Items:**
- [ ] Verify all CRITICAL invariants have enforcement
- [ ] Document enforcement gap (if any)
- [ ] Create service layer guards for missing DB constraints

---

### Phase 2: State Machine Analysis (CRITICAL — 20 min)

**DetailSOP Status Lifecycle:**

```
DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI →
SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI →
DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU → DICABUT/DIGANTIKAN
```

**Valid Transitions:**
```typescript
const VALID_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT: ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN: ['SIAP_DIEVALUASI', 'REVISI_DARI_TIM_EVALUASI'],
  SIAP_DIEVALUASI: ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI: ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI: ['SIAP_DIVERIFIKASI', 'REVISI_DARI_TIM_EVALUASI'],
  REVISI_DARI_TIM_EVALUASI: ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI: ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU: ['DICABUT', 'DIGANTIKAN'],
  DICABUT: [], // Terminal
  DIGANTIKAN: [], // Terminal
};
```

**Terminal States:** `BERLAKU`, `DICABUT`, `DIGANTIKAN`

**Invalid Transitions to Prevent:**
- DRAFT → BERLAKU (skip all intermediate)
- BERLAKU → DRAFT (terminal tidak bisa kembali)
- DICABUT → apapun (terminal absolut)

**Action Items:**
- [ ] Implement VALID_TRANSITIONS const in service
- [ ] Add guard: `if (!VALID_TRANSITIONS[current].includes(next)) throw`
- [ ] Document terminal states

---

### Phase 3: Concurrency Check (CRITICAL ONLY — 25 min)

**Operations Needing `SELECT FOR UPDATE`:**

| Operation | Tables | Why | Isolation Level |
|-----------|--------|-----|-----------------|
| Create KEPALA_OPD | Pengguna, AnggotaTimPenyusun | Prevent double KEPALA_OPD | Serializable |
| Create KOORDINATOR | Pengguna, AnggotaTimPenyusun | Prevent double KOORDINATOR | Serializable |
| Create PengajuanEvaluasi | PengajuanEvaluasi, KunciPengajuanEvaluasi | Prevent double pengajuan | Serializable |

**Pattern for SELECT FOR UPDATE di Prisma:**

```typescript
async function createKepalaOpd(opdId: number, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    // Lock OPD row
    const existingOpd = await tx.oPD.findFirst({
      where: { id: opdId },
      select: { id: true },
    });

    if (!existingOpd) {
      throw new NotFoundException('OPD not found');
    }

    // Check if KEPALA_OPD already exists
    const existingKepala = await tx.anggotaTimPenyusun.findFirst({
      where: { opdId, peranInternal: 'KOORDINATOR', status: 'AKTIF' },
    });

    if (existingKepala) {
      throw new ConflictException('OPD sudah memiliki KEPALA_OPD aktif');
    }

    // Create KEPALA_OPD
    return tx.anggotaTimPenyusun.create({
      data: { userId, opdId, peranInternal: 'KOORDINATOR', status: 'AKTIF' },
    });
  }, {
    isolationLevel: 'Serializable',
  });
}
```

**Optimistic Locking (NilaiEvaluasi):**

```typescript
async function updateNilai(id: string, newHasil: HasilEvaluasi, version: number) {
  const result = await this.prisma.nilaiEvaluasi.update({
    where: { id, version }, // version check
    data: { 
      hasil: newHasil,
      version: version + 1,
    },
  });
  
  if (result.count === 0) {
    throw new ConflictException('Data telah diubah oleh evaluator lain');
  }
}
```

**Action Items:**
- [ ] Implement SELECT FOR UPDATE pattern for 3 critical operations
- [ ] Verify optimistic locking on NilaiEvaluasi
- [ ] Test concurrent requests in staging

---

### Phase 4: Index Strategy (ESSENTIAL — 15 min)

**Priority 1 (Critical for core queries):**

```sql
CREATE INDEX idx_sop_opd_status ON SOP(opdId, status);
CREATE INDEX idx_pengajuan_opd_status ON PengajuanEvaluasi(opdId, status);
CREATE INDEX idx_nilai_pengajuan ON NilaiEvaluasi(pengajuanEvaluasiId);
```

**Priority 2 (Important for soft delete filtering):**

```sql
CREATE INDEX idx_sop_opd_deleted ON SOP(opdId, deletedAt);
CREATE INDEX idx_detail_sop_deleted ON DetailSOP(sopId, deletedAt);
```

**Priority 3 (Nice to have for reporting):**

```sql
CREATE INDEX idx_riwayat_sop ON RiwayatTandaTangan(sopDetailId);
CREATE INDEX idx_log_edit_sop ON LogEditSOP(sopDetailId, createdAt);
```

**Already Covered by Prisma:**
- Primary keys (UUID) — auto-indexed
- Unique constraints (nomorSop, email) — auto-indexed
- Foreign keys — manual index needed (see Priority 1)

**Action Items:**
- [ ] Create Priority 1 indexes before production
- [ ] Add Priority 2 if queries slow
- [ ] Monitor slow query log

---

### Phase 5: Prisma Patterns (ESSENTIAL — 20 min)

**❌ SLOW: N+1 Query**
```typescript
const sops = await prisma.sOP.findMany({ where: { opdId: 1 } });
for (const sop of sops) {
  const detailSops = await prisma.detailSOP.findMany({
    where: { sopId: sop.id },
  });
}
```

**✅ FAST: Single Query with Include**
```typescript
const sops = await prisma.sOP.findMany({
  where: { opdId: 1 },
  include: { detailSops: true },
});
```

**❌ DANGEROUS: No Transaction**
```typescript
await prisma.detailSOP.update({
  where: { id: '1' },
  data: { status: 'DIAJUKAN_EVALUASI' },
});
await prisma.pengajuanEvaluasi.create({
  data: { sopDetailIds: ['1'] },
});
```

**✅ SAFE: Transaction**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.detailSOP.update({
    where: { id: '1' },
    data: { status: 'DIAJUKAN_EVALUASI' },
  });
  await tx.pengajuanEvaluasi.create({
    data: { sopDetailIds: ['1'] },
  });
}, {
  isolationLevel: 'Serializable',
});
```

**❌ WRONG: Soft Delete Not Filtered**
```typescript
const totalSops = await prisma.sOP.count({
  where: { opdId: 1 },
});
```

**✅ CORRECT: Soft Delete Filtered**
```typescript
const totalSops = await prisma.sOP.count({
  where: { opdId: 1, deletedAt: null },
});
```

**Action Items:**
- [ ] Review all queries for N+1
- [ ] Wrap multi-write in transaction
- [ ] Add `deletedAt: null` filter to all soft-delete queries

---

## Output Contract

Generate audit report in this format:

```markdown
===========================================
DATABASE AUDIT (FYP SIMPLIFIED)
===========================================
Date: [date]
Schema Version: [v1.0]

---
INVARIANT STATUS
---
| Invariant | Enforced | Gap | Action |
|-----------|----------|-----|--------|
| [P0-B] 1 DetailSOP BERLAKU | ✅ Trigger + Service | None | None |
| [P0-C] Maks 1 pengajuan aktif | ⚠️ Service only | Missing sentinel | Create tabel KunciPengajuanEvaluasi |

---
STATE MACHINE
---
Valid transitions: [list]
Terminal states: [list]
Guard implemented: YES / NO

---
CONCURRENCY PATTERNS
---
SELECT FOR UPDATE needed: [list operations]
Optimistic locking: [which tables]

---
INDEX PLAN
---
Priority 1: [list indexes]
Priority 2: [list indexes]

---
PRISMA PATTERNS
---
N+1 risk: [yes/no, where]
Transaction gaps: [yes/no, where]
Soft delete filtering: [complete/partial]

---
TOP 3 ACTIONS
---
1. [Most critical fix]
2. [Second priority]
3. [Third priority]

===========================================
PRODUCTION READY: YES / NO / CONDITIONAL
Confidence: HIGH / MEDIUM / LOW
===========================================
```

---

## Trigger Conditions

Invoke this skill when:
- ✅ Designing new Prisma schema
- ✅ Reviewing existing schema before migration
- ✅ Debugging data inconsistency
- ✅ Preparing for production deployment

Do NOT invoke when:
- ❌ Need deep concurrency analysis (use full `database-engineer.md`)
- ❌ Planning sharding strategy (overkill for FYP)
- ❌ Optimizing for 1M+ rows (premature)

---

*Last updated: 2026-04-01 — FYP Simplified from database-engineer.md*
