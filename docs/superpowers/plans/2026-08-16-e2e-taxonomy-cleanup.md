# E2E Taxonomy Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pisahkan true business E2E dari functional/smoke/integration tests dan hilangkan legacy Playwright coverage yang menyesatkan tanpa mengurangi safety net penting.

**Architecture:** `client/e2e/journeys` tetap menjadi critical business E2E. Browser functional dan smoke tests dijalankan lewat script eksplisit. API-only behavior tetap pada server integration layer, sementara redundant/meta Playwright specs dihapus.

**Tech Stack:** Playwright, TypeScript, Node.js scripts, GitHub Actions, NestJS/Jest integration tests.

## Global Constraints

- Jangan ubah business logic aplikasi.
- Jangan menambah dependency.
- J01–J07 harus tetap critical CI gate.
- Functional browser tests harus masuk CI.
- Jangan mengklaim API-only/static metadata sebagai executable business E2E.

---

### Task 1: Remove misleading legacy Playwright specs

**Files:**
- Delete: `client/e2e/scenario-traceability.spec.ts`
- Delete: `client/e2e/workflow-observation.spec.ts`
- Delete: `client/e2e/sop-concurrency.spec.ts`

- [ ] Hapus meta traceability spec dari Playwright.
- [ ] Hapus workflow observation smoke spec yang redundant.
- [ ] Hapus concurrency API-only spec dari Playwright; server integration suite tetap menjadi layer untuk concurrency/invariant behavior.

### Task 2: Tighten critical business journeys

**Files:**
- Modify: `client/e2e/journeys/sop-lifecycle.spec.ts`
- Modify: `client/e2e/support/business-actions.ts`

- [ ] Hapus assertion editor/workbench kosmetik dari J05.
- [ ] Ubah J06 agar memakai `expectPublicArchiveExcludes` melalui browser untuk outcome publik.
- [ ] Pertahankan server state assertions sebagai invariant audit.

### Task 3: Make test taxonomy explicit in scripts

**Files:**
- Modify: `client/package.json`

- [ ] Pertahankan `test:e2e:critical` untuk J01–J07.
- [ ] Pertahankan functional browser suite eksplisit.
- [ ] Tambahkan `test:e2e:smoke` untuk `layout-shell`, `profile-tte`, dan `public-pages`.
- [ ] Ubah `test:e2e:all` agar mengomposisikan intended browser suites, bukan glob semua spec secara implisit.

### Task 4: Run functional browser regression in CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] Setelah critical E2E environment tersedia, jalankan functional browser regression.
- [ ] Jalankan smoke regression juga agar route/profile/layout public surfaces tidak stale.
- [ ] Pertahankan failure artifacts Playwright.

### Task 5: Align documentation

**Files:**
- Modify: `client/e2e/README.md`
- Modify: `docs/e2e-business-journeys.md`

- [ ] Jelaskan tiga browser layers: business journeys, functional, smoke/UI regression.
- [ ] Jelaskan API-only behavior berada di server integration tests.
- [ ] Hapus framing `E2E-01..70` sebagai jumlah executable E2E evidence.

### Task 6: Verification

- [ ] Audit diff memastikan tidak ada production source file berubah.
- [ ] Jalankan/trigger CI pada branch.
- [ ] Verifikasi critical J01–J07, functional browser suite, smoke suite, typecheck/lint/build semuanya hijau.
- [ ] Jika semua hijau, siapkan PR untuk merge.
