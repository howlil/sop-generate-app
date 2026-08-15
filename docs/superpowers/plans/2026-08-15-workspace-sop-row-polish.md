# Workspace SOP Row Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make compact SOP items in the shared signing/evaluation workbench look like integrated workspace rows rather than nested mini-cards.

**Architecture:** Keep the existing shared `SOPListCard` and `SopWorkbenchSidePanel`. Change only the compact visual contract in `sop-list-card.tsx`, so PJ Evaluator, PJ Penyusun, and Kepala OPD inherit the same treatment automatically. Lock the contract with focused component tests.

**Tech Stack:** React, TypeScript, Tailwind CSS design tokens, Vitest, Testing Library.

## Global Constraints

- Frontend/UI-only.
- No API, DTO, Prisma, workflow, TTE/signing, permission, preview, print/PDF, or data-fetching behavior changes.
- Status copy and semantic color mapping stay unchanged in this pass.
- Use existing design tokens; no new arbitrary colors, shadows, or gradients.

---

### Task 1: Lock the integrated workspace-row contract

**Files:**
- Modify: `client/src/components/sop/__tests__/sop-list-card.test.tsx`

**Interfaces:**
- Consumes: `SOPListCard` with `variant="compact"`.
- Produces: regression assertions for the compact workspace-row shell.

- [ ] **Step 1: Write the failing test**

Update the compact selected-state test so it requires the row to use a transparent default workspace surface, a subtle divider, a restrained selected surface, and no standalone card silhouette. Assert that the compact row has `border-b`, `border-x-0`, `border-t-0`, `rounded-none`, and the selected workspace surface class while rejecting full-border/card classes.

- [ ] **Step 2: Run the focused test to verify RED**

Run the repository client unit-test command scoped to `sop-list-card.test.tsx`. Expected: the new assertion fails against the current compact row style.

- [ ] **Step 3: Commit the failing contract test**

Commit message: `test(client): lock integrated workspace SOP rows`.

### Task 2: Implement the workspace row shell

**Files:**
- Modify: `client/src/components/sop/sop-list-card.tsx`

**Interfaces:**
- Consumes: existing `variant="compact"` path and existing status-chip rendering.
- Produces: compact SOP rows visually integrated with the shared workbench panel.

- [ ] **Step 1: Make the minimal compact-style change**

Keep the compact item full-width and flat. Use no perimeter border or standalone radius, preserve a subtle bottom divider, use a low-contrast hover surface, and use a restrained selected surface plus the existing 2px left primary indicator. Do not change status rendering or click behavior.

- [ ] **Step 2: Run the focused test to verify GREEN**

Run the client unit test scoped to `sop-list-card.test.tsx`. Expected: pass.

- [ ] **Step 3: Run broader client verification**

Run client typecheck, lint, unit tests, and build through the repository CI workflow. Expected: all pass.

- [ ] **Step 4: Commit implementation**

Commit message: `refactor(client): integrate SOP rows with workspace panel`.

### Task 3: PR verification and merge

**Files:**
- No production file changes unless verification finds a regression.

**Interfaces:**
- Consumes: branch with Task 1-2 commits.
- Produces: reviewed and merged PR to `main`.

- [ ] **Step 1: Open PR against `main`**

Title: `refactor(client): polish workspace SOP rows`.

- [ ] **Step 2: Wait for full CI**

Require client/server quality, database invariants, critical E2E journeys, and container build to complete successfully.

- [ ] **Step 3: Verify final diff is UI-only**

Confirm only documentation, the focused SOP list test, and the shared SOP list component changed.

- [ ] **Step 4: Merge**

Squash merge after CI is green.
