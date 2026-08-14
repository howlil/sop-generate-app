# Evaluation Detail Workbench Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make authenticated evaluation/detail pages use one restrained workbench language: compact summary header, calm SOP side panel, controlled progress strip, and consistent preview toolbar.

**Architecture:** Keep the change frontend-only. Prefer small presentational components and existing primitives over a large rewrite. Migrate pages incrementally so existing workflow, signing, preview, print, and data-fetch behavior remain unchanged.

**Tech Stack:** React, TypeScript, Tailwind, Vitest/Testing Library, Playwright critical E2E, GitHub Actions CI.

## Global Constraints

- Frontend/UI-only.
- Do not change backend/API/DTO/Prisma.
- Do not change SOP workflow transition rules.
- Do not change TTE/signing behavior.
- Do not change print/PDF generation behavior.
- Do not change permission checks.
- Do not change data fetching or mutation hooks.
- Do not rewrite generated SOP/BA document content.
- Follow TDD: write failing tests before production changes.

---

## File Map

- Modify `client/src/components/sop/sop-list-card.tsx`: enforce compact side-panel selected/card/chip contract.
- Modify `client/src/components/sop/__tests__/sop-list-card.test.tsx`: lock compact contract.
- Create `client/src/components/evaluasi/detail-summary-header.tsx`: reusable compact summary header.
- Create `client/src/components/evaluasi/__tests__/detail-summary-header.test.tsx`: header contract tests.
- Modify `client/src/components/evaluasi/pengajuan-evaluasi-status-header.tsx`: calm workflow progress strip controls and banner hierarchy.
- Modify or create tests near the status header if existing tests are present; otherwise cover via page-level tests.
- Modify `client/src/components/pengajuan/sop-document-preview-pane.tsx`: align preview tabs/control placement and canvas spacing.
- Modify page files using the preview pane only through existing props; do not alter renderer internals.
- Modify `client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx`: use compact workbench header/side panel/preview.
- Modify `client/src/pages/pj-evaluator/evaluasi/DetailPengajuanEvaluasi.tsx`: use compact workbench header/side panel/progress/preview/right panel alignment.
- Modify `client/src/pages/penyusun/koordinator/berita-acara/DetailBeritaAcaraPage.tsx` only if it still uses the old selected side-panel style.
- Modify `client/src/pages/pj-evaluator/evaluasi/components/RiwayatEvaluasiTimeline.tsx`: align right panel visual density.
- Modify `client/src/pages/kepala-opd/sop/PantauSOP.tsx`: final minor hierarchy/action/count polish.
- Modify `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`, `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`, and `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`: minor final IA/action polish only.
- Update E2E selectors in `client/e2e/journeys/evaluation-lifecycle.spec.ts` or related support files if visual text changes require it.

---

### Task 1: Lock and apply compact SOP side-panel card contract

**Files:**
- Modify: `client/src/components/sop/__tests__/sop-list-card.test.tsx`
- Modify: `client/src/components/sop/sop-list-card.tsx`
- Modify consumers that render side-panel SOP cards with default variant.

**Interfaces:**
- Consumes: existing `SOPListCard` props.
- Produces: `variant="compact"` side-panel contract: neutral selected surface, left accent bar, no full blue fill, small quiet chips.

- [ ] **Step 1: Write failing tests**

Add tests asserting compact active cards do not use full blue selected fill and do render a left accent marker. Also assert compact status chips are label-free.

- [ ] **Step 2: Verify RED**

Run the focused component test in CI or local runner. Expected: fail because current relevant route/contract still permits old visual treatment in some consumers.

- [ ] **Step 3: Implement minimal production change**

Update `SOPListCard` compact styles and route consumers so all detail side panels pass `variant="compact"`.

- [ ] **Step 4: Verify GREEN**

Run the focused component test. Expected: pass.

- [ ] **Step 5: Commit**

Commit message: `fix(client): unify compact SOP side panel cards`.

---

### Task 2: Add shared `DetailSummaryHeader`

**Files:**
- Create: `client/src/components/evaluasi/detail-summary-header.tsx`
- Create: `client/src/components/evaluasi/__tests__/detail-summary-header.test.tsx`
- Modify: `client/src/pages/kepala-opd/pengajuan/PengajuanDetailSummaryHeader.tsx` or replace its local implementation with the shared component.

**Interfaces:**
- Produces `DetailSummaryHeader` props: `title`, `statusLabel`, `statusTone`, `summary`, `metadata`, `actions`, `menu`.
- Consumed by Kepala OPD and PJ Evaluator detail pages.

- [ ] **Step 1: Write failing tests**

Test title/status adjacency, summary line rendering, secondary metadata rendering, and action/menu slots.

- [ ] **Step 2: Verify RED**

Run the focused component test. Expected: fail because shared component does not exist.

- [ ] **Step 3: Implement minimal component**

Implement presentational component only. No data fetching, no workflow logic.

- [ ] **Step 4: Migrate Kepala OPD detail header**

Use the shared component while preserving existing action handlers and menu items.

- [ ] **Step 5: Verify GREEN**

Run component/header tests.

- [ ] **Step 6: Commit**

Commit message: `refactor(client): add evaluation detail summary header`.

---

### Task 3: Migrate PJ Evaluator evaluation detail header and progress hierarchy

**Files:**
- Modify: `client/src/pages/pj-evaluator/evaluasi/DetailPengajuanEvaluasi.tsx`
- Modify: `client/src/components/evaluasi/pengajuan-evaluasi-status-header.tsx`
- Add/update relevant unit tests if component tests exist.

**Interfaces:**
- Consumes: `DetailSummaryHeader` from Task 2.
- Preserves: existing signing button handlers, status data, collapse/expand behavior.

- [ ] **Step 1: Write failing tests**

Assert the PJ Evaluator header exposes a human-readable task title, status near title, action slot, and subordinate technical metadata. Assert the workflow collapse button is ghost/quiet copy, not a dominant outlined control.

- [ ] **Step 2: Verify RED**

Run relevant unit tests. Expected: fail due old sparse header/progress hierarchy.

- [ ] **Step 3: Implement minimal production change**

Use shared header and calm progress strip styles. Keep existing handlers and state names intact.

- [ ] **Step 4: Verify GREEN**

Run focused tests.

- [ ] **Step 5: Commit**

Commit message: `refactor(client): align evaluator detail header and progress strip`.

---

### Task 4: Normalize preview workbench toolbar

**Files:**
- Modify: `client/src/components/pengajuan/sop-document-preview-pane.tsx`
- Modify tests if existing; otherwise add a focused unit test for toolbar behavior.

**Interfaces:**
- Preserve existing preview props and rendering.
- Produce toolbar behavior: preview tabs left, SOP-only `Flowchart/BPMN` control right, no diagram control on BA tab.

- [ ] **Step 1: Write failing tests**

Assert `Flowchart`/`BPMN` controls are colocated with the preview toolbar for SOP preview and not rendered on Berita Acara tab.

- [ ] **Step 2: Verify RED**

Run focused tests. Expected: fail because controls are currently floating or not in toolbar contract.

- [ ] **Step 3: Implement minimal production change**

Move existing controls; do not alter document renderer, iframe, scrolling, print, or generated content.

- [ ] **Step 4: Verify GREEN**

Run focused tests.

- [ ] **Step 5: Commit**

Commit message: `refactor(client): normalize SOP preview workbench toolbar`.

---

### Task 5: Align optional right panel / evaluation history

**Files:**
- Modify: `client/src/pages/pj-evaluator/evaluasi/components/RiwayatEvaluasiTimeline.tsx`
- Modify: `client/src/pages/pj-evaluator/evaluasi/DetailPengajuanEvaluasi.tsx` if right-panel wrapper spacing is owned there.

**Interfaces:**
- Preserve evaluator name/date/change summary content.
- Produce quiet card border and panel spacing aligned with SOP side panel.

- [ ] **Step 1: Write failing test or snapshot-like semantic test**

Assert the history region has a clear heading, compact card, evaluator/date text, and no extra selected/decorative emphasis class when not active.

- [ ] **Step 2: Verify RED**

Run focused test. Expected: fail if old card hierarchy is still used.

- [ ] **Step 3: Implement minimal production change**

Update classes/layout only.

- [ ] **Step 4: Verify GREEN**

Run focused test.

- [ ] **Step 5: Commit**

Commit message: `refactor(client): calm evaluator history panel`.

---

### Task 6: Final minor polish for Pantau SOP and Manajemen OPD

**Files:**
- Modify: `client/src/pages/kepala-opd/sop/PantauSOP.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`

**Interfaces:**
- Preserve existing filters, CRUD, routing, delete/revoke rules.
- Produce clearer title/subtitle/count/action grouping and consistent `Ubah` action label.

- [ ] **Step 1: Write failing tests**

Assert `Pantau SOP` has a visible section title/subtitle and result count close to filters. Assert Manajemen OPD has content title/subtitle and search/create in one toolbar.

- [ ] **Step 2: Verify RED**

Run focused tests. Expected: fail on missing/weak final hierarchy contract if not already present.

- [ ] **Step 3: Implement minimal production change**

Adjust classes/copy/layout only.

- [ ] **Step 4: Verify GREEN**

Run focused tests.

- [ ] **Step 5: Commit**

Commit message: `refactor(client): finish admin list surface polish`.

---

### Task 7: Final verification, PR, and CI

**Files:**
- Update E2E selectors only if required.
- No production changes unless tests reveal a true regression.

**Interfaces:**
- Produces draft PR into `main`.

- [ ] **Step 1: Run relevant client checks**

Run focused unit tests first, then rely on CI for full server/client/database/E2E/container gates.

- [ ] **Step 2: Open draft PR**

Open PR with summary, guardrails, tests, and known non-blocking notes.

- [ ] **Step 3: Watch CI**

If CI fails, inspect failing job logs, fix root cause, and repeat until green.

- [ ] **Step 4: Mark ready and merge only after green**

Fetch fresh PR state and head SHA before any merge.

