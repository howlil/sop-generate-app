# State: Sistem Informasi SOP Biro Organisasi

## Project Reference

**Core Value:** Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

**Current Focus:** Backend v1.0 implementation -- building NestJS API endpoints that the existing client UI will consume.

**Stack:** NestJS 11 + Prisma 7 + MariaDB (server) | React 19 + TanStack Router + Zustand (client, already complete)

## Current Position

**Milestone:** v1.0 Backend Implementation
**Phase:** 01-database-infrastructure
**Plan:** 01-01 complete; awaiting 01-02
**Status:** Phase 1 Plan 1 executed -- Prisma schema written and validated

```
Phase Progress: [>_______] 1/8
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0/8 |
| Requirements done | 3/66 |
| Plans executed | 1 |
| Bugs found | 0 |
| Revisions | 0 |

## Accumulated Context

### Key Decisions
- Phase structure follows natural domain boundaries: DB -> Auth -> Reference Data -> Teams -> SOP Core -> Evaluasi -> TTE -> Audit
- SOP Core (Phase 5) is the largest phase (22 requirements) because SOP metadata, pelaksana, and procedure steps are tightly coupled
- Phase 4 (Tim) and Phase 3 (OPD/Peraturan) both depend on Phase 2 (Auth) but not on each other
- Phase 8 (Audit Log) depends on Phase 5 but is sequenced last because it cross-cuts all status transitions
- SOPMetadata fields merged into SOP model (1:1 normalization -- avoids separate table)
- RelatedSOP uses composite @@id([sopId, relatedSopId]) -- no surrogate UUID for join table
- ProsedurRow self-FK uses named relations "YesStep"/"NoStep" to resolve Prisma ambiguity
- Posts module fully removed; Users module kept as auth pattern reference
- Client detail pages use shared `DetailWorkspace` with collapsible side panels; collapse behavior standardized by removing wrapper min-width locks
- Client navigation/page labels for BA workflow are centralized via `IA` constants to keep terms consistent across roles
- Tim Penyusun now has explicit TTE route (`/tim-penyusun/ttd-elektronik`) for parity with role-specific TTE setup flow
- Detail SOP primary completion action sets status to `Siap Dievaluasi` (not `Sedang Disusun`) to align with evaluation request rules

### Architecture Notes
- Server follows Controller -> Service -> Repository -> Prisma pattern (existing scaffold)
- JWT stateless auth with opdId in token for per-OPD data filtering
- Global ValidationPipe, ResponseInterceptor, and ExceptionFilter already configured
- Prisma schema uses composite PKs (@@id) for M:M join tables (RelatedSOP, ProsedurRowPelaksana)
- Named @relation decorators required for self-referential models in Prisma

### Known Concerns
- Client TTE uses hardcoded PIN '12345' -- must be replaced with server-side PIN verification (Phase 7)
- Client has zero backend integration -- all data from seed JSON + Zustand stores
- Repository interfaces use `any` types -- improve typing as modules are built
- No CI/CD pipeline -- not in scope for v1.0
- Client automated tests are still minimal (baseline domain test added); broader coverage for hooks/stores/routing still needed

### Todos
- (none yet)

### Blockers
- (none)

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| server-db-uc | Analisis DB vs use case: `docs/DATABASE-USE-CASE-ALIGNMENT.md` — gap utama: kolom verifikasi Biro di `VerifikasiBatch` | 2026-03-25 | f591238 | Done | — |
| client-ssot | Client: align routes redirects & sidebar prefixes with `ROUTES`; `DEFAULT_SOP_STATUS`; `canEditSop` for tombol Selesai | 2026-03-25 | e46c614 | Done | — |
| client-pipeline-ux | Client: notifikasi antar-role (persist), bulk pengesahan, BV3/FL2/FL3 domain, akses koordinator (dashboard per-role dihapus; lihat b73b3a4) | 2026-03-25 | fb3725d | Done | — |
| 260325-cns | Fix BPMN dan flowchart path routing - paths berantakan tumpang tindih mengenai sisi shape rendering lambat | 2026-03-25 | 45416a2 | Needs Review | [260325-cns-fix-bpmn-dan-flowchart-path-routing-path](./quick/260325-cns-fix-bpmn-dan-flowchart-path-routing-path/) |
| 260325-client-ux-hardening | Client: panel width/collapse consistency all roles, remove pipeline hints, move "Selesai" action to Detail SOP, right-align OPD action column, add first Vitest domain test | 2026-03-25 | — | Done | — |

## Session Continuity

**Last session:** 2026-03-25 -- Phase 1 context gathered via /ez:discuss-phase 1
**Stopped at:** CONTEXT.md created with all schema decisions (cascade, index, seed, evaluasi terjadwal/mandiri, schema gaps)
**Next action:** /ez:plan-phase 1 — create executable plans incorporating new decisions (schema modifications + seed + migration)
**Context to preserve:** Schema needs modifications: +verifiedByUserId, +signedByKoordinatorUserId, +tanggalEvaluasi, +nilaiOPD, +evaluatorId, +rekomendasi, +sopId/batchId on TTESignature, +ImplementQualification model, +Komentar model, hapus timEvaluasiId, rename JenisBatch values, add indexes on all FKs + composite SOP(opdId,status), cascade rules, FakerJS seed. Old plan files deleted from worktree — need fresh plans.

---
*State initialized: 2026-03-25*
*Last updated: 2026-03-25*
