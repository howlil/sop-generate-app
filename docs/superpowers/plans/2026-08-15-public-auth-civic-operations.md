# Public Auth Civic Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign landing and login into one professional government SaaS experience while preserving all existing routing and authentication behavior.

**Architecture:** Keep the existing React/TanStack routes and shared UI primitives. Split the oversized landing page into focused public-section components and replace the decorative login hero with an institutional auth panel. Add source-level UI contract tests for visual/domain guardrails, then rely on the repository CI for typecheck, lint, unit tests, build, and critical E2E.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Lucide React, Vitest, Testing Library, pnpm.

## Global Constraints

- Frontend presentation change only; no backend, DTO, Prisma, API, auth, permission, or workflow changes.
- Use branch `refactor/public-auth-civic-operations`.
- Preserve `ROUTES.ARSIP.PREFIX`, `ROUTES.VALIDASI.PDF`, and `ROUTES.AUTH.LOGIN` behavior.
- Preserve login validation and `useAuth()` behavior.
- Use existing `APP_DISPLAY_NAME`, logo, theme tokens, and Kantor Gubernur image.
- No decorative gradients, glow/orbs, glassmorphism, giant shadows, role rainbow themes, fake metrics, or default pill-shaped controls.
- Do not claim certified BSrE/Komdigi TTE; copy must reflect internal/simulated signing described in `docs/requirements.md`.
- Landing richness comes from editorial layout, process visualization, institutional photography, and realistic product surfaces.
- Require CI before merge.

---

### Task 1: Lock public/auth visual and domain contracts

**Files:**
- Create: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Reads `LandingPage.tsx`, `LoginPage.tsx`, `LoginHero.tsx`, and `LoginForm.tsx` as source contracts.
- Produces regression guardrails for required public utilities, lifecycle copy, domain accuracy, and banned decorative patterns.

- [ ] **Step 1: Write the failing test**

Assert that the landing source includes `Arsip SOP`, `Validasi PDF`, all seven lifecycle stages, `Pemerintah Provinsi Sumatera Barat`, and `Biro Organisasi`; assert it excludes `bg-gradient`, `shadow-xl`, `rounded-3xl`, and `TTE BSRE`.

Assert that login sources include `Masuk ke sistem`, institutional identity, and exclude `Futuristic Hero`, `blur-3xl`, `bg-gradient`, `TTE BSRE`, plus decorative mail/lock imports.

- [ ] **Step 2: Verify RED in CI**

Open the PR with the test-only commit. Expected: client unit test job fails against the current landing/login implementation.

- [ ] **Step 3: Proceed only after the failure demonstrates the intended missing contract**

---

### Task 2: Build the Civic Operations landing page

**Files:**
- Modify: `client/src/pages/LandingPage.tsx`
- Create: `client/src/pages/landing/public-header.tsx`
- Create: `client/src/pages/landing/institutional-hero.tsx`
- Create: `client/src/pages/landing/public-utilities.tsx`
- Create: `client/src/pages/landing/workflow-overview.tsx`
- Create: `client/src/pages/landing/role-overview.tsx`
- Create: `client/src/pages/landing/document-integrity.tsx`
- Create: `client/src/pages/landing/public-footer.tsx`

**Interfaces:**
- `LandingPage()` composes the public sections only.
- Section components consume `APP_DISPLAY_NAME`, shared assets, and `ROUTES`; they do not fetch data.
- `RoleOverview()` owns only local selected-role UI state.

- [ ] **Step 1: Replace full-screen marketing hero with asymmetric institutional hero**
- [ ] **Step 2: Add public utility surfaces directly after hero**
- [ ] **Step 3: Add seven-stage lifecycle and one realistic evaluation/document preview**
- [ ] **Step 4: Add neutral role explorer covering all five authenticated roles**
- [ ] **Step 5: Add traceability/integrity editorial section without external-certification claims**
- [ ] **Step 6: Replace gradient CTA with institutional access band and footer**
- [ ] **Step 7: Keep mobile stacking, visible focus states, semantic headings, and existing public routes**

---

### Task 3: Redesign login as institutional access

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`
- Modify: `client/src/pages/login/components/LoginHero.tsx`
- Modify: `client/src/pages/login/components/LoginForm.tsx`

**Interfaces:**
- `LoginPage()` keeps `useAuth()` and passes `login`/`isLoggingIn` to `LoginForm` unchanged.
- `LoginHero()` becomes a static institutional information panel; it performs no auth work.
- `LoginForm` keeps the same props and validation contract.

- [ ] **Step 1: Replace gradient/orb panel with deep-navy institutional composition and restrained photo treatment**
- [ ] **Step 2: Show the real lifecycle as informational labels without fake completion state**
- [ ] **Step 3: Change form framing to `Masuk ke sistem` and administrator-account guidance**
- [ ] **Step 4: Remove decorative email/lock icons while keeping password visibility control**
- [ ] **Step 5: Preserve validation, submit loading state, back navigation, autocomplete, and errors**

---

### Task 4: Verify and finish

**Files:**
- Review all files changed by Tasks 1–3.

**Interfaces:**
- No new runtime dependencies.

- [ ] **Step 1: Run CI through the PR**

Expected jobs include client typecheck, E2E journey audit, lint, unit tests, build, critical E2E, and container build.

- [ ] **Step 2: Inspect diff for banned visual patterns and inaccurate TTE copy**

Search changed public/auth files for `bg-gradient`, `blur-3xl`, `shadow-xl`, `rounded-3xl`, and `TTE BSRE`. Expected: none.

- [ ] **Step 3: Confirm routes and auth behavior are unchanged**

Review the diff to ensure only presentation/component structure and copy changed.

- [ ] **Step 4: Complete branch only after CI is green**
