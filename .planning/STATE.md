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
| 20260402-security-fixes | Fix critical security vulnerabilities: JWT_SECRET required, rate limiting (10 req/hr), error boundaries, CORS hardening, consistent error messages | 2026-04-02 | 45f5aa0 | Done | server/ |
| 20260402-code-review | Code review lengkap dengan .skills/code-review.md framework — score 6/10, temuan: security vulnerabilities, no tests, missing indexes | 2026-04-02 | — | Done | server/ |
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
*Last updated: 2026-04-02 — Security critical fixes complete (JWT_SECRET required, rate limiting, error boundaries, CORS hardening)*
