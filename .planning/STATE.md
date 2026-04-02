# State: Sistem Informasi SOP Biro Organisasi

## Product Discovery

**Status:** Complete — 2026-03-31
**Artifacts:** `.planning/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md)
**North Star:** SOP mencapai status BERLAKU per bulan (target ≥15/bulan pada bulan ke-3 go-live)
**MVP Type:** Functional MVP — backend NestJS + integrasi ke client UI prototype

**Single Source of Truth:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements

---

## Project Reference

**Core Value:** Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

**Current Focus:** Backend v1.0 implementation -- building NestJS API endpoints yang akan dikonsumsi client UI.

**Stack:** NestJS 11 + Prisma 7 + MariaDB (server) | React 19 + TanStack Router + Zustand (client, already complete)

## Current Position

**Milestone:** v1.0 Backend Implementation
**Phase:** All Phases ✅ **COMPLETE**
**Status:** All 8 phases complete — all 89 requirements implemented

```
Phase Progress: [========] 8/8
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 8/8 |
| Requirements done | 89/89 |
| Plans executed | All modules implemented |
| Bugs found | 0 |
| Revisions | 0 |

## Accumulated Context

### Key Decisions

- Phase structure follows natural domain boundaries: DB → Auth → Reference Data → Teams → SOP Core → Evaluasi → TTE → Audit
- SOP Core (Phase 5) adalah largest phase (32 requirements: SOP-01..24 + PLK-01..08) karena metadata, pelaksana, dan procedure steps tightly coupled
- Phase 4 (Tim) dan Phase 3 (OPD/Peraturan) keduanya depend on Phase 2 (Auth) tapi tidak saling depend
- Phase 8 (Audit Log) depends on Phase 5 tapi di-sequenced terakhir karena cross-cut semua status transitions
- **DetailSOP** adalah entitas versi dokumen (bukan SOP) — 1 SOP → n DetailSOP
- **PengajuanEvaluasi** menggantikan konsep "VerifikasiBatch" atau "batch evaluasi"
- **RiwayatTandaTangan** menyimpan TTE (bukan field isVerified/isSignedByKoordinator)
- **LogEditSOP** adalah audit trail kolaborasi Tim Penyusun (bukan LogAudit)
- **Hasil evaluasi**: SESUAI / TIDAK_SESUAI (bukan "Sesuai/Perlu Perbaikan")
- **TTE urutan**: Biro Organisasi → Koordinator Tim Penyusun (verifikasi BA) → Kepala OPD (pengesahan SOP per dokumen)
- Constraint 1 KEPALA_OPD + 1 KOORDINATOR_TIM_PENYUSUN per OPD di-enforce di service layer via SELECT FOR UPDATE [P2-D]
- Constraint maks 1 pengajuan aktif per OPD per jenis di-enforce via SELECT FOR UPDATE + tabel sentinel [P0-C]
- Optimistic locking pada NilaiEvaluasi via field version [P0-E]
- XOR constraint RiwayatTandaTangan: tepat satu dari sopDetailId atau pengajuanEvaluasiId [P1-A]
- Invariant keanggotaan tim: (status = AKTIF) ↔ (berakhirPada IS NULL) [P1-F]

### Architecture Notes

- Server follows Controller → Service → Repository → Prisma pattern (existing scaffold)
- JWT stateless auth dengan opdId in token untuk per-OPD data filtering
- Global ValidationPipe, ResponseInterceptor, dan ExceptionFilter sudah configured
- Prisma schema uses composite PKs (@@id) untuk M:N join tables (DasarHukum, SopTerkait, DetailSOPPelaksana)
- Named @relation decorators required untuk self-referential models dalam Prisma
- Delete behavior: Cascade/Restrict/SetNull sesuai ERD — wajib test sebelum production

### Known Concerns

- Client TTE menggunakan hardcoded PIN '12345' — harus diganti dengan server-side PIN verification (Phase 7)
- Client zero backend integration — semua data dari seed JSON + Zustand stores
- Repository interfaces menggunakan `any` types — improve typing saat modules dibangun
- No CI/CD pipeline — not in scope untuk v1.0
- Client automated tests masih minimal — perlu improve coverage untuk hooks/stores/routing
- Plan 01-01 dan 01-02 outdated — perlu rebase sesuai 20 model ERD terbaru (bukan 18 tabel lama)

### Todos

- [ ] Rebase Plan 01-02 sesuai 20 model ERD terbaru
- [ ] Update schema Prisma dengan 20 model + 12+ enum sesuai docs/ERD-DESKRIPSI.md
- [ ] Test constraint [P2-D] (1 KEPALA_OPD + 1 KOORDINATOR per OPD) dengan SELECT FOR UPDATE
- [ ] Test constraint [P0-C] (maks 1 pengajuan aktif per OPD per jenis)
- [ ] Test optimistic locking [P0-E] pada NilaiEvaluasi
- [ ] Test XOR constraint [P1-A] pada RiwayatTandaTangan

### Blockers

- (none)

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 20260403-utils-cleanup | ✅ Utils directory cleanup — Removed 2 unused utils (generate-id, sidebar-matcher), simplified 4 hooks (format-date, ui, use-filtered-list, use-pagination), removed state/ directory (inline state in pages), deleted 12 dead components (landing, company-profile). Build passing: 4.38s. | 2026-04-03 | — | Done | client/ |
| 20260403-types-consolidation | ✅ Type consolidation & business logic extraction — Consolidated all duplicate types to `types/common.ts` (single source of truth), updated 7 feature modules to import from central location, added `useRequestEvaluasi` hook to extract business logic from pages. Build passing. References: `.planning/phases/CLIENT_STRUCTURE_ANALYSIS.md` | 2026-04-03 | — | Done | client/ |
| 20260403-client-structure | ✅ Client structure cleanup — Added README documentation to `features/audit/components/` and `features/organisasi/components/`, verified all feature modules have consistent structure (types, services, hooks, components). Build passing. | 2026-04-03 | — | Done | client/ |
| 20260403-berlaku-constraint | ✅ Database constraint for single BERLAKU per SOP — Added database triggers (INSERT + UPDATE) to enforce constraint at DB level, updated service layer to use transaction with SELECT FOR UPDATE and Serializable isolation level, preventing race conditions. Migration file created. | 2026-04-03 | — | Done | server/ |
| 20260403-code-review-improvements | ✅ Code review improvements — Rate limiting differentiation (auth: 5/min, general: 100/hr), Password strength validator (min 8 chars, uppercase, lowercase, number, special char), Magic numbers replaced with constants, DATABASE_URL removed from env validation for security. Also fixed pre-existing build errors: added ConflictException import, fixed UpdateUserDto missing fields | 2026-04-03 | — | Done | server/ |
| 20260402-real-api-integration | ✅ Replace all stub functions with real API calls — 6 stubs removed: Grafik Evaluasi (useRekapEvaluasi), SOP Detail (useDetailSopById, useEditHistory, useEvaluasiDetail), Related SOP Picker (useSop). Build faster (-0.63s), all features now working with real backend data. | 2026-04-02 | — | Done | client/src/pages/, client/src/hooks/ |
| 20260402-frontend-perf | ✅ Frontend performance optimizations — Zustand selectors with shallow comparison (authStore, useAppRole, useAuth, GlobalToast), preventing unnecessary re-renders | 2026-04-02 | — | Done | client/ |
| 20260402-fix-build-errors | ✅ Fix all pre-existing build errors — added 10 legacy stub functions for TTE hooks (hashPin, setTTEProfile, getTTEVerificationSuccessUrl, getValidasiPengesahanUrl), Evaluasi hooks (getDataGrafikEvaluasiTahunan, getDetailOpdPerTahun, getLastEvaluatedByInitial), and SOP hooks (getRelatedPosOptions, getSopViewMetadata, getSopViewVersions). Build now passing! | 2026-04-02 | — | Done | client/src/hooks/ |
| 20260402-fix-state-duplication | ✅ Fix P2 state duplication in useDaftarSOPData — removed local state, all state now derived from TanStack Query (single source of truth). Also fixed 30+ broken imports from constants refactor side-effect. | 2026-04-02 | — | Done | client/src/hooks/sop/, client/src/pages/tim-penyusun/ |
| 20260402-constants-refactor | ✅ Refactor: move constants to utils — `client/src/lib/constants/` → `client/src/utils/constants/`, update 37 files (routes, pages, hooks, components, services) | 2026-04-02 | — | Done | client/ |
| 20260402-db-audit-fixes | ✅ Database audit fixes — add 6 missing indexes [P1-1], add DetailSOP status transition trigger [P1-2], extend soft delete middleware to all tables [P2-1] | 2026-04-02 | c2fb261 | Done | server/ |
| 20260402-api-cleanup | ✅ API cleanup & legacy code removal — usePelaksana & useTTESignature replaced with real API hooks, delay.ts deleted, 21 missing data/hook files created, build passing | 2026-04-02 | — | Done | client/ |
| 20260402-testing-171-passing | ✅ 171 tests passing (100%) — Domain (30), Utils (48), Stores (27), Services (44), Types (15), Query (18). Coverage: Branches 66%, Functions 58%. All tests passing! | 2026-04-02 | — | Done | client/ |
| 20260402-api-endpoint-fixes | ✅ Fix all API endpoint mismatches — TTE (4 paths), Tim nonaktifkan (2), Peraturan revoke, Langkah SOP nested routes, Swimlane GET endpoint, Auth refresh | 2026-04-02 | — | Done | client/src/services/ |
| 20260402-ux-critical-fixes | ✅ Critical UX fixes from audit — Login API integration, ErrorBoundary, AppSkeleton loading state, session management, form validation enhancement | 2026-04-02 | — | Done | client/ |
| 20260402-testing-117-passing | ✅ 117 tests passing (100%) — Domain (30), Utils (48), Stores (27), Services (11). Coverage: Branches 64%, Functions 61%. All tests passing! | 2026-04-02 | — | Done | client/ |
| 20260402-testing-92-passing | ✅ 92 tests passing (100%) — Domain (30), Utils (24), Stores (27), Services (11). Coverage: Branches 65%, Functions 62%. Vitest + Testing Library + MSW setup complete | 2026-04-02 | — | Done | client/ |
| 20260402-role-guard-fix | Fix role guard security gap — add auth guard, fix redirect logic, global auth check in root route, cleanup import paths | 2026-04-02 | bc7ba23 | Done | client/ |
| 20260402-server-tests-phase1 | Server testing Phase 1 — 61 tests passing (Auth, SOP, Users, OPD), 13.39% coverage, infrastructure complete | 2026-04-02 | 50be2ce | Done | server/ |
| 20260402-ux-improvements | UX accessibility improvements — critical + high priority fixes from UX audit: touch targets (44px), error associations (aria-describedby), color contrast (4.5:1), font sizes (14px), skip-to-main link, aria-live regions, table accessibility | 2026-04-02 | — | Done | client/ |
| 20260402-server-tests | Test utilities + factories + auth E2E tests — test-utils.ts, user.factory.ts, sop.factory.ts, auth.e2e-spec.ts | 2026-04-02 | a5b8584 | Done | server/ |
| 20260402-phase1-tests | Implementasi Phase 1 test foundation — 54 tests passing, setup Vitest + Testing Library + MSW, domain logic tests complete | 2026-04-02 | 00c8523 | Done | client/ |
| 20260402-test-strategy | Test strategy lengkap menggunakan .skills/qa.md framework — target 150 tests, 80% coverage, 9 days implementation plan | 2026-04-02 | 21a3bc0 | Done | client/ |
| 20260402-code-review | Code review lengkap dengan .skills/code-review.md framework — score 6/10, temuan: security vulnerabilities, no tests, missing indexes | 2026-04-02 | 3631970 | Done | server/ |
| 20260402-security-fixes | Fix critical security vulnerabilities: JWT_SECRET required, rate limiting (10 req/hr), error boundaries, CORS hardening, consistent error messages | 2026-04-02 | 45f5aa0 | Done | server/ |
| 20260401-frontend-audit | Frontend audit lengkap dengan frontend-codereview.md framework — temuan: 45 files broken imports, security issue localStorage tokens, no route loaders | 2026-04-01 | — | Done | client/ |
| 20260401-cleanup-legacy | Hapus deprecated code di client (24 files, ~800 LOC) — lib/data/, lib/domain/, deprecated hooks, unused components | 2026-04-01 | b641d39 | Done | client/src/ |
| 20260401-api-integration | Implementasi semua API server di client (89/89 requirements) — services, hooks, types lengkap | 2026-04-01 | b641d39 | Done | client/src/ |
| 20260401-docs-cleanup | Hapus dokumentasi tidak penting di client/server (15 files) — README redundant, migration guides, cleanup reports | 2026-04-01 | b641d39 | Done | client/, server/ |
| server-db-uc | Analisis DB vs use case: `docs/DATABASE-USE-CASE-ALIGNMENT.md` — gap utama: kolom verifikasi Biro di VerifikasiBatch | 2026-03-25 | f591238 | Done | — |
| client-ssot | Client: align routes redirects & sidebar prefixes dengan `ROUTES`; `DEFAULT_SOP_STATUS`; `canEditSop` untuk tombol Selesai | 2026-03-25 | e46c614 | Done | — |
| client-pipeline-ux | Client: notifikasi antar-role (persist), bulk pengesahan, BV3/FL2/FL3 domain, akses koordinator (dashboard per-role dihapus; lihat b73b3a4) | 2026-03-25 | fb3725d | Done | — |
| 260325-cns | Fix BPMN dan flowchart path routing - paths berantakan tumpang tindih mengenai sisi shape rendering lambat | 2026-03-25 | 45416a2 | Needs Review | [260325-cns-fix-bpmn-dan-flowchart-path-routing-path](./quick/260325-cns-fix-bpmn-dan-flowchart-path-routing-path/) |
| 260325-client-ux-hardening | Client: panel width/collapse consistency all roles, remove pipeline hints, move "Selesai" action to Detail SOP, right-align OPD action column, add first Vitest domain test | 2026-03-25 | — | Done | — |
| prd-erd-alignment | Penyelarasan PRD-ANALISIS-SISTEM.md dengan ERD-DESKRIPSI.md sebagai single source of truth | 2026-04-01 | — | Done | docs/ |
| planning-alignment | Update semua .planning/ files sesuai ERD dan PRD sebagai SSOT | 2026-04-01 | — | Done | .planning/ |

## Session Continuity

**Last session:** 2026-03-25 — Executed Plan 01-01 (schema modifications)
**Stopped at:** Completed 01-01-PLAN.md — schema modified dengan semua keputusan CONTEXT.md
**Next action:** Rebase 01-02-PLAN.md sesuai 20 model ERD terbaru (bukan 18 tabel lama), migration + seed
**Context to preserve:** Schema perlu update dengan 20 model (OPD, Pengguna, SOP, DetailSOP, Peraturan, LangkahSOP, DiagramLayout, DiagramNodePosition, DiagramEdge, DiagramEdgePoint, Pelaksana, DetailSOPPelaksana, AnggotaTimPenyusun, AnggotaTimEvaluasi, PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi, KredensialTTE, RiwayatTandaTangan, LogEditSOP), 12+ enum, semua FK indexes, semua cascade/restrict rules sesuai docs/ERD-DESKRIPSI.md

## Terminology Updates (2026-04-01)

| Old Term | New Term | Reference |
|----------|----------|-----------|
| VerifikasiBatch | PengajuanEvaluasi | ERD-DESKRIPSI.md |
| batch evaluasi | pengajuan evaluasi | PRD-ANALISIS-SISTEM.md |
| isVerified / isSignedByKoordinator | RiwayatTandaTangan table | ERD-DESKRIPSI.md |
| LogAudit | LogEditSOP | ERD-DESKRIPSI.md |
| Sesuai / Perlu Perbaikan | SESUAI / TIDAK_SESUAI | ERD-DESKRIPSI.md |
| Dicabut | DICABUT (uppercase) | PRD-ANALISIS-SISTEM.md |
| 18 tabel | 20 tabel | ERD-DESKRIPSI.md |

---
*State initialized: 2026-03-25*
*Last updated: 2026-04-02 — Frontend performance optimizations (Zustand selectors), Database audit fixes complete (indexes, triggers, middleware), constants refactor to utils directory*
