# Quick Tasks — Database Schema Fixes

**Created:** 2 April 2026  
**Source:** DATABASE SCHEMA AUDIT REPORT

## Tasks

### [P0-2] Add TTE XOR CHECK constraint
- **File:** `server/prisma/constraints.sql`
- **Effort:** Low (1 hour)
- **Status:** ✅ Already implemented in constraints.sql

### [P1-1] Create missing indexes
- **File:** `server/prisma/migrations/20260402000000_add_indexes.sql`
- **Effort:** Low (30 minutes)
- **Status:** ✅ Created migration file

### [P1-2] Add status transition trigger for DetailSOP
- **File:** `server/prisma/triggers.sql`
- **Effort:** Medium (2 hours)
- **Status:** ✅ Added to triggers.sql

### [P2-1] Extend soft delete middleware
- **File:** `server/src/common/prisma/prisma.service.ts`
- **Effort:** Low (1 hour)
- **Status:** ✅ Extended to all soft-delete tables

### [P2-2] Add auto-update trigger for updatedAt
- **File:** `server/prisma/triggers.sql`
- **Effort:** Medium (4 hours for all tables)
- **Status:** ⚠️ Deferred (Prisma @updatedAt handles most cases)

---

## Execution Log

| Task | Started | Completed | Commit |
|------|---------|-----------|--------|
| [P0-2] TTE XOR constraint | - | ✅ | Already implemented |
| [P1-1] Missing indexes | 2026-04-02 | ✅ 2026-04-02 | TODO |
| [P1-2] Status transition trigger | 2026-04-02 | ✅ 2026-04-02 | TODO |
| [P2-1] Soft delete middleware | 2026-04-02 | ✅ 2026-04-02 | TODO |
| [P2-2] Auto-update trigger | - | ⚠️ Deferred | N/A |

---

## Summary

**Completed:** 4/5 tasks (80%)  
**Deferred:** 1 task (P2-2 — low priority, Prisma handles it)

### Files Changed:
1. `server/prisma/migrations/20260402000000_add_indexes.sql` — NEW
2. `server/prisma/triggers.sql` — Updated (added trg_detailsop_status_transition)
3. `server/src/common/prisma/prisma.service.ts` — Updated (extended soft delete models)

### Next Steps:
1. Apply migrations: `npx prisma db execute --file prisma/migrations/20260402000000_add_indexes.sql`
2. Apply triggers: `npx prisma db execute --file prisma/triggers.sql`
3. Test in development environment
4. Commit and deploy
