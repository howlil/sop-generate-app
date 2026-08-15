# Login Institutional Service Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SOPFlow login screen from a generated SaaS-style poster into a mature institutional service portal while preserving all authentication behavior.

**Architecture:** Keep the existing `LoginPage`, `LoginHero`, and `LoginForm` boundaries. `LoginPage` owns shell layout and mobile brand header, `LoginHero` owns the service identity panel, and `LoginForm` owns auth state, validation, password visibility, and submission.

**Tech Stack:** React, TypeScript, Tailwind CSS, TanStack Router, Vitest source-contract tests, existing UI primitives.

## Global Constraints

- Frontend/UI-only.
- No backend/API/DTO/Prisma changes.
- No authentication behavior, route, permission, workflow, archive fetching, or PDF validation logic changes.
- No new external assets or libraries.
- Preserve `await onSubmitLogin({ email, kataSandi: password })` exactly.
- Preserve client-side validation strings for email/password.
- Avoid dark billboard photo overlays, gradients, glow effects, and overdecorated SaaS-template styling.

---

## File Structure

- Modify `client/src/pages/login/LoginPage.tsx`: centered institutional shell, compact header, 7:5 desktop grid.
- Modify `client/src/pages/login/components/LoginHero.tsx`: service identity panel with compact workflow and controlled photo accent.
- Modify `client/src/pages/login/components/LoginForm.tsx`: quieter form card content, title `Masuk ke SOPFlow`, concise support copy, no auth behavior change.
- Modify `client/src/pages/__tests__/public-auth-design-contract.test.ts`: lock the new anti-slop design constraints and preserved auth behavior.

---

### Task 1: Contract for Institutional Portal Shell

**Files:**
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: source files read through `readSource`.
- Produces: failing source-contract expectations for institutional layout and copy.

- [ ] **Step 1: Write the failing test**

Update the balanced split test to expect centered shell language and reject full-height poster layout:

```ts
it('uses an institutional shell instead of a full-height poster split', () => {
  expect(loginPageSource).toContain('lg:grid-cols-[minmax(0,7fr)_minmax(360px,5fr)]')
  expect(loginPageSource).toContain('max-w-[1180px]')
  expect(loginPageSource).toContain('min-h-screen bg-[#f5f7fb]')
  expect(loginPageSource).not.toContain('lg:grid-cols-2')
  expect(loginPageSource).not.toContain('hidden min-h-screen lg:block')
  expect(loginPageSource).toContain('LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login}')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`
Expected: FAIL because `LoginPage.tsx` still uses `lg:grid-cols-2` and full-height split.

- [ ] **Step 3: Commit RED contract**

Commit message:

```bash
git commit -m "test(client): require institutional login shell"
```

---

### Task 2: Implement Institutional Shell

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`

**Interfaces:**
- Consumes: `LoginHero` and `LoginForm` components.
- Produces: centered shell with `lg:grid-cols-[minmax(0,7fr)_minmax(360px,5fr)]`.

- [ ] **Step 1: Replace full-height split**

Use a page shell with a max-width container and 7:5 grid:

```tsx
<div className="min-h-screen bg-[#f5f7fb] text-foreground">
  <main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-10">
    ...
  </main>
</div>
```

- [ ] **Step 2: Keep mobile brand header**

Keep logo/brand visible on mobile, but remove oversized desktop poster behavior.

- [ ] **Step 3: Run source-contract test**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`
Expected: task 1 test PASS; hero/form-specific tests may still FAIL until later tasks.

- [ ] **Step 4: Commit**

Commit message:

```bash
git commit -m "refactor(client): center login institutional shell"
```

---

### Task 3: Replace Billboard Hero With Service Identity Panel

**Files:**
- Modify: `client/src/pages/login/components/LoginHero.tsx`
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Produces visible text: `Akses Internal SOPFlow`, `Pengelolaan SOP AP dari evaluasi hingga arsip.`, `Draft`, `Evaluasi`, `Berita Acara`, `Arsip`.

- [ ] **Step 1: Update contract**

Expect service-panel vocabulary and reject dark overlay billboard classes:

```ts
expect(loginHeroSource).toContain('Akses Internal SOPFlow')
expect(loginHeroSource).toContain('Pengelolaan SOP AP dari evaluasi hingga arsip.')
expect(loginHeroSource).toContain('Berita Acara')
expect(loginHeroSource).not.toContain('bg-slate-950/72')
expect(loginHeroSource).not.toContain('h-[360px]')
```

- [ ] **Step 2: Implement panel**

Create a bordered white service card with a small image strip/accent, workflow row, and no long paragraph.

- [ ] **Step 3: Run source-contract test**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`
Expected: hero tests PASS.

- [ ] **Step 4: Commit**

Commit message:

```bash
git commit -m "refactor(client): replace login billboard with service panel"
```

---

### Task 4: Refine Login Form Surface

**Files:**
- Modify: `client/src/pages/login/components/LoginForm.tsx`
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Must preserve `onSubmitLogin({ email, kataSandi: password })` and validation copy.
- Produces title `Masuk ke SOPFlow` and concise support copy.

- [ ] **Step 1: Update contract**

```ts
expect(loginFormSource).toContain('Masuk ke SOPFlow')
expect(loginFormSource).toContain('Akun internal')
expect(loginFormSource).toContain('Hubungi administrator instansi')
expect(loginFormSource).not.toContain('Masuk dengan akun resmi')
expect(loginFormSource).toContain('await onSubmitLogin({ email, kataSandi: password })')
```

- [ ] **Step 2: Implement visual refinement**

Use a quiet header, compact metadata chip, stronger submit button, and short help row.

- [ ] **Step 3: Run source-contract test**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`
Expected: all source-contract tests PASS.

- [ ] **Step 4: Commit**

Commit message:

```bash
git commit -m "refactor(client): refine institutional login form"
```

---

### Task 5: PR, CI, and Merge

**Files:**
- No source file edits unless CI fails.

**Interfaces:**
- Produces PR against `main` from `refactor/login-institutional-service-portal`.

- [ ] **Step 1: Open draft PR**

PR title: `refactor(client): redesign login as institutional service portal`.

- [ ] **Step 2: Wait for CI**

Required checks:
- Client quality
- Critical E2E business journeys
- Container build
- Other repository CI jobs that trigger on PR

- [ ] **Step 3: If CI fails, patch only the failing frontend/test issue**

Do not change backend, API, Prisma, auth payload, routes, permissions, or workflow logic.

- [ ] **Step 4: Mark ready and squash merge**

Only merge when the PR is mergeable and CI completed successfully for the latest head SHA.
