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

### Todos
- (none yet)

### Blockers
- (none)

## Session Continuity

**Last session:** 2026-03-25 -- Executed plan 01-01 (Prisma schema + Posts scaffold removal)
**Stopped at:** Completed 01-01-PLAN.md
**Next action:** Execute Plan 01-02 (database migration and Prisma client generation)
**Context to preserve:** schema.prisma has 18 models and 11 enums, validated with npx prisma validate. DATABASE_URL env var needed for migration in Plan 01-02.

---
*State initialized: 2026-03-25*
*Last updated: 2026-03-25*
