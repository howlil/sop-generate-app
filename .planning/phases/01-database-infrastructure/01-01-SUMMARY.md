---
phase: 01-database-infrastructure
plan: 01
subsystem: database
tags: [prisma, mariadb, schema, enums, indexes, cascade]

# Dependency graph
requires: []
provides:
  - "Complete Prisma schema with 20 models, 12 enums, all FK indexes, and cascade/restrict rules"
  - "ImplementQualification and Komentar models for SOP qualification tracking and evaluation comments"
  - "VerifikasiBatch fields for evaluator tracking (verifiedByUserId, signedByKoordinatorUserId, tanggalEvaluasi, nilaiOPD)"
  - "EvaluasiItem evaluatorId FK for per-SOP evaluator tracking (open pool pattern)"
  - "TTESignature sopId/batchId nullable FKs for per-document TTE audit"
affects: [01-02-PLAN (migration + seed), phase-02 (auth), phase-05 (SOP core), phase-06 (evaluasi), phase-07 (TTE)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "onDelete Restrict/Cascade/SetNull on every @relation — no implicit defaults"
    - "@@index on every FK column for MariaDB (no auto-indexing)"
    - "Composite @@index([opdId, status]) on SOP for most common query pattern"
    - "Named @relation for multi-FK references to same model (BatchVerifiedBy, BatchSignedByKoordinator, EvaluasiEvaluator)"

key-files:
  created: []
  modified:
    - "server/prisma/schema.prisma"

key-decisions:
  - "Removed timEvaluasiId from VerifikasiBatch — evaluator open pool, tracking via EvaluasiItem.evaluatorId"
  - "Removed PERLU_PERBAIKAN from HasilEvaluasi — workflow only uses SESUAI and REVISI_BIRO"
  - "Renamed JenisBatch: INISIASI_BIRO -> TERJADWAL, REQUEST_OPD -> MANDIRI"
  - "ProsedurRow self-FK uses onDelete: SetNull (deleting step nulls reference, no cascade)"
  - "SOP.peraturan uses onDelete: SetNull (peraturan revocation keeps SOP intact)"
  - "RelatedSOP both sides use onDelete: Cascade (join row deleted with either SOP)"

patterns-established:
  - "Every @relation must have explicit onDelete rule"
  - "Every FK column must have @@index"
  - "New child models of SOP follow pattern: uuid id, sopId FK, @db.Text for content, onDelete: Cascade"

requirements-completed: [DB-01, DB-02, DB-03]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 01 Plan 01: Schema Modifications Summary

**Prisma schema expanded to 20 models with 12 enums, 29 FK indexes, 36 onDelete rules, new VerifikasiBatch/EvaluasiItem/TTESignature fields, and ImplementQualification+Komentar models**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T07:25:30Z
- **Completed:** 2026-03-25T07:28:26Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Modified Prisma schema from 18 to 20 models with ImplementQualification and Komentar
- Applied all CONTEXT.md decisions: enum renames, field additions, field removals, cascade rules
- Added 29 @@index declarations covering all FK columns plus composite SOP(opdId, status)
- Added explicit onDelete rules (Restrict, Cascade, SetNull) on all 36 @relation decorators
- Schema passes `prisma validate` successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Modify Prisma schema with all CONTEXT.md decisions** - `edf7098` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `server/prisma/schema.prisma` - Complete domain schema: 20 models, 12 enums, all indexes and cascade rules

## Decisions Made
- Removed `timEvaluasiId` from VerifikasiBatch and `verifikasiBatch` reverse relation from TimEvaluasiAnggota (evaluator open pool per CONTEXT.md)
- Removed `PERLU_PERBAIKAN` from HasilEvaluasi enum (workflow only uses SESUAI and REVISI_BIRO per CONTEXT.md specifics)
- Applied `onDelete: SetNull` to SOP.peraturan (peraturan can be revoked, SOP keeps existing)
- Applied `onDelete: SetNull` to ProsedurRow self-FKs (deleting a step should null the reference, not cascade delete)
- Applied `onDelete: Cascade` to RelatedSOP both sides (join row deleted with either SOP)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Schema is complete and validated, ready for Plan 01-02 (migration squash, Prisma generate, FakerJS seed)
- All 20 models have proper FK constraints, indexes, and cascade rules
- No blockers for migration generation

## Self-Check: PASSED

- FOUND: server/prisma/schema.prisma
- FOUND: commit edf7098
- FOUND: .planning/phases/01-database-infrastructure/01-01-SUMMARY.md
- prisma validate: exit 0
- 20 models, 12 enums, 29 @@index, 36 onDelete rules confirmed
- 0 occurrences of timEvaluasiId, PERLU_PERBAIKAN, INISIASI_BIRO confirmed

---
*Phase: 01-database-infrastructure*
*Completed: 2026-03-25*
