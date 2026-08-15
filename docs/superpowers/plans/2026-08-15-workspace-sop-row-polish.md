# Workspace SOP Card Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make compact SOP items in the shared signing/evaluation workbench use the same restrained card language as other workspace panels.

**Architecture:** Keep the existing shared `SOPListCard` and `SopWorkbenchSidePanel`. Change only the compact visual contract in `sop-list-card.tsx`, so PJ Evaluator, PJ Penyusun, and Kepala OPD inherit the same treatment automatically. Mirror the existing `RiwayatVersiPanel` card grammar and lock it with focused component tests.

**Tech Stack:** React, TypeScript, Tailwind CSS design tokens, Vitest, Testing Library.

## Global Constraints

- Frontend/UI-only.
- No API, DTO, Prisma, workflow, TTE/signing, permission, preview, print/PDF, or data-fetching behavior changes.
- Status copy and semantic color mapping stay unchanged in this pass.
- Use existing design tokens; no new arbitrary colors, shadows, or gradients.

---

### Task 1: Lock the workspace-card contract

**Files:**
- Modify: `client/src/components/sop/__tests__/sop-list-card.test.tsx`

**Interfaces:**
- Consumes: `SOPListCard` with `variant="compact"`.
- Produces: regression assertions for the compact workspace-card shell.

- [ ] **Step 1: Write the failing test**

Update the compact selected-state test to require `rounded-control`, full `border`, `border-primary`, and `bg-primary-subtle` on the selected item. Reject the old `rounded-none`, `border-x-0`, flat `bg-surface-subtle` selected shell, and detached left selection rail.

- [ ] **Step 2: Run the focused test to verify RED**

Run the repository client unit-test command scoped to `sop-list-card.test.tsx`. Expected: failure because the current compact item still uses the flat row treatment.

- [ ] **Step 3: Commit the failing contract test**

Commit message: `test(client): lock workspace SOP card styling`.

### Task 2: Implement the shared workspace card shell

**Files:**
- Modify: `client/src/components/sop/sop-list-card.tsx`

**Interfaces:**
- Consumes: existing `variant="compact"` path and existing status-chip rendering.
- Produces: compact SOP cards matching other workspace cards.

- [ ] **Step 1: Make the minimal compact-style change**

Use `rounded-control border border-border bg-surface` for inactive compact cards, `hover:bg-surface-subtle` for hover, and `border-primary bg-primary-subtle` for the selected card. Remove the compact left selection rail. Add small panel gutters/spacing through the compact list wrapper. Do not change status rendering, click behavior, or non-compact styling.

- [ ] **Step 2: Run the focused test to verify GREEN**

Run the client unit test scoped to `sop-list-card.test.tsx`. Expected: pass.

- [ ] **Step 3: Run broader client verification**

Run client typecheck, lint, unit tests, and build through repository CI. Expected: all pass.

- [ ] **Step 4: Commit implementation**

Commit message: `refactor(client): match SOP cards to workspace styling`.

### Task 3: PR verification and merge

**Files:**
- No production file changes unless verification finds a regression.

**Interfaces:**
- Consumes: branch with Task 1-2 commits.
- Produces: reviewed and merged PR to `main`.

- [ ] **Step 1: Open PR against `main`**

Title: `refactor(client): polish workspace SOP cards`.

- [ ] **Step 2: Wait for full CI**

Require client/server quality, database invariants, critical E2E journeys, and container build to complete successfully.

- [ ] **Step 3: Verify final diff is UI-only**

Confirm only documentation, the focused SOP list test, and the shared SOP list component changed.

- [ ] **Step 4: Merge**

Squash merge after CI is green.
