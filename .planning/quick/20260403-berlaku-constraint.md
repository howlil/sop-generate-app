# Quick Task: Code Review Follow-up — BERLAKU Constraint

**Created:** 2026-04-03
**Source:** 2026-04-02 code review finding #1 (Priority 1 - Critical)
**Goal:** Implement database-level constraint to prevent race conditions for single BERLAKU version per SOP

---

## Problem Statement

**Issue:** Only service layer enforcement for "single BERLAKU per SOP" constraint

**Risk:** Race condition — two concurrent requests could both pass the check before either inserts, resulting in multiple BERLAKU versions.

**Severity:** P0 (Critical) — Data integrity violation, could cause production incidents

---

## Solution: Multi-Layer Defense

### Layer 1: Database Triggers (Absolute Enforcement)

**File:** `server/prisma/migrations/20260403000000_add_single_berlaku_trigger/migration.sql`

- `check_single_berlaku_on_insert` — BEFORE INSERT trigger
- `check_single_berlaku_per_sop` — BEFORE UPDATE trigger
- Both throw SQL error: "SOP sudah memiliki versi BERLAKU"
- Cannot be bypassed by any client (application bugs, direct DB access, etc.)

### Layer 2: Application Transaction (Concurrency Control)

**File:** `server/src/modules/sop/service/detail-sop.service.ts`

```typescript
await this.prisma.$transaction(async (tx) => {
  // Lock SOP row to prevent concurrent BERLAKU creation
  await this.repo.lockSopForUpdate(sopId, tx);
  
  // Check if another BERLAKU version exists
  const berlakuCount = await this.repo.countBerlakuBySopId(sopId, tx);
  if (berlakuCount > 0) {
    throw new ConflictException(DetailSopMessages.EVALUATION_EXISTS);
  }
  
  // Update status within transaction
  await this.repo.updateStatus(id, dto.status, user.id);
}, {
  isolationLevel: 'Serializable',
});
```

### Layer 3: Repository Support

**File:** `server/src/modules/sop/repository/detail-sop.repository.ts`

- `lockSopForUpdate(sopId, tx)` — Uses raw query for SELECT FOR UPDATE
- `countBerlakuBySopId(sopId, tx?)` — Supports transactional counting

---

## Implementation Details

### Defense in Depth

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Application Transaction (SELECT FOR UPDATE)│
│ - Locks SOP row before check                        │
│ - Serializable isolation                            │
│ - Prevents concurrent BERLAKU creation              │
├─────────────────────────────────────────────────────┤
│ Layer 2: Database Trigger (BEFORE INSERT/UPDATE)    │
│ - Absolute enforcement at DB level                  │
│ - Cannot be bypassed by any client                  │
│ - Catches edge cases application might miss         │
└─────────────────────────────────────────────────────┘
```

### Why Multi-Layer?

| Layer | Protects Against | Limitation |
|-------|------------------|------------|
| Application | Concurrent requests (same instance) | Doesn't protect against direct DB access, bugs, deployment race conditions |
| Database Trigger | ALL access patterns | Cannot provide user-friendly error messages, harder to test |
| Combined | Everything | Best of both worlds |

---

## Files Modified

1. **New Migration:**
   - `server/prisma/migrations/20260403000000_add_single_berlaku_trigger/migration.sql`

2. **Service Layer:**
   - `server/src/modules/sop/service/detail-sop.service.ts`
   - Added PrismaService injection
   - Updated `updateStatus()` to use transaction for BERLAKU transition

3. **Repository Layer:**
   - `server/src/modules/sop/repository/detail-sop.repository.ts`
   - Added `lockSopForUpdate()` method
   - Updated `countBerlakuBySopId()` to support transactions

4. **Documentation:**
   - `.planning/quick/20260403-berlaku-constraint.md` (this file)
   - `.planning/STATE.md` — Quick Tasks Completed table

---

## Testing Strategy

### Manual Testing Required

```sql
-- Test 1: Try to create second BERLAKU version (should fail)
-- Setup: Create SOP with one BERLAKU DetailSOP
-- Action: Try to update another DetailSOP to BERLAKU
-- Expected: Trigger fires, error thrown

-- Test 2: Concurrent BERLAKU updates (race condition test)
-- Setup: Two DetailSOPs in DIVERIFIKASI_BIRO_ORGANISASI status
-- Action: Send two simultaneous requests to update both to BERLAKU
-- Expected: One succeeds, one fails with ConflictException
```

### Integration Test (Future)

```typescript
describe('BERLAKU constraint', () => {
  it('should prevent race condition for BERLAKU status', async () => {
    // Create two DetailSOPs in DIVERIFIKASI_BIRO_ORGANISASI status
    const detail1 = await createDetailSop({ status: 'DIVERIFIKASI_BIRO_ORGANISASI' });
    const detail2 = await createDetailSop({ status: 'DIVERIFIKASI_BIRO_ORGANISASI' });

    // Try to update both to BERLAKU concurrently
    const [result1, result2] = await Promise.allSettled([
      updateStatus(detail1.id, 'BERLAKU'),
      updateStatus(detail2.id, 'BERLAKU'),
    ]);

    // One should succeed, one should fail
    expect([result1.status, result2.status]).toContain('fulfilled');
    expect([result1.status, result2.status]).toContain('rejected');
  });
});
```

---

## Acceptance Criteria

- [x] Database triggers created for INSERT and UPDATE
- [x] Service layer uses transaction with SELECT FOR UPDATE
- [x] Serializable isolation level configured
- [x] Repository supports transactional operations
- [x] Build passing (verified with `pnpm run build`)
- [x] STATE.md updated
- [ ] Integration test created (deferred — manual testing first)

---

## Rollback Plan

If issues arise:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS `check_single_berlaku_per_sop`;
DROP TRIGGER IF EXISTS `check_single_berlaku_on_insert`;

-- Revert code changes
git revert b928d6f
```

---

## Related

- **Source Issue:** 2026-04-02 code review finding #1
- **Commit:** b928d6f — db: add BERLAKU constraint with triggers and transactions
- **Parent Task:** 20260403-code-review-improvements

---

## Notes

Following EZ Agents quick mode:
- Atomic commit for this specific fix
- Updates to STATE.md "Quick Tasks Completed" table
- No discussion phase — requirements clear from code review
- Verification: Build passing, manual database testing recommended
