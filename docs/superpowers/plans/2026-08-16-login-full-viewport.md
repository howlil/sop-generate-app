# Full-Viewport Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved SOPFlow login from a centered floating auth card into a true full-viewport 45/55 split page without changing authentication behavior.

**Architecture:** Keep the existing `LoginPage`, `LoginHero`, and `LoginForm` boundaries. `LoginPage` becomes the edge-to-edge responsive split shell; `LoginHero` becomes the full-height left viewport panel; `LoginForm` stays behaviorally unchanged and remains width-constrained inside the right panel.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, TanStack Router, Lucide React, Vitest source-contract tests, GitHub Actions CI.

## Global Constraints

- Frontend/UI only.
- Desktop login must visually occupy the full viewport (`100vw × 100vh`).
- Desktop split is approximately 45% left / 55% right.
- No outer `max-width`, page inset, rounded auth shell, outer border, or outer card shadow.
- Preserve the existing SOPFlow blue layered gradient and SOP-specific hero content.
- Preserve form content width around `max-w-[430px]`.
- Preserve exactly `await onSubmitLogin({ email, kataSandi: password })`.
- Preserve validation strings, loading state, password visibility behavior, route semantics, redirects, and focus-visible accessibility.
- No social login, registration prompt, new auth provider, new dependency, or unrelated refactor.

---

## File Structure

- Modify `client/src/pages/__tests__/public-auth-design-contract.test.ts`: change the shell contract from centered-card to full-viewport and keep auth guardrails.
- Modify `client/src/pages/login/LoginPage.tsx`: edge-to-edge responsive page shell and 45/55 desktop split.
- Modify `client/src/pages/login/components/LoginHero.tsx`: remove inset/card behavior and fill the left desktop viewport.
- Keep `client/src/pages/login/components/LoginForm.tsx` unchanged unless verification proves a layout-specific spacing defect.

---

### Task 1: Define the Full-Viewport Contract

**Files:**
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: source text from `LoginPage.tsx`, `LoginHero.tsx`, and `LoginForm.tsx` through the existing `readSource` helper.
- Produces: a failing contract that distinguishes a true split-screen login from the current centered card.

- [ ] **Step 1: Replace the centered-card shell assertions**

Use this contract for the first test:

```ts
it('uses a true full-viewport split login shell', () => {
  expect(loginPageSource).toContain('min-h-screen')
  expect(loginPageSource).toContain('lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]')
  expect(loginPageSource).toContain('lg:min-h-screen')
  expect(loginPageSource).not.toContain('max-w-[1120px]')
  expect(loginPageSource).not.toContain('rounded-[22px]')
  expect(loginPageSource).not.toContain('shadow-raised')
  expect(loginPageSource).not.toContain('lg:place-items-center')
  expect(loginPageSource).not.toContain('lg:py-10')
  expect(loginPageSource).toContain('LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login}')
})
```

- [ ] **Step 2: Add a hero edge-to-edge assertion**

Extend the hero test with:

```ts
expect(loginHeroSource).toContain('lg:min-h-screen')
expect(loginHeroSource).not.toContain('m-1.5')
expect(loginHeroSource).not.toContain('sm:m-2')
expect(loginHeroSource).not.toContain('rounded-[18px]')
```

Keep the existing checks for `Portal Internal SOP`, the SOP headline, institution line, workflow stages, and gradients.

- [ ] **Step 3: Keep form behavior assertions unchanged**

Retain exact checks for:

```ts
expect(loginFormSource).toContain('await onSubmitLogin({ email, kataSandi: password })')
expect(loginFormSource).toContain('Email wajib diisi')
expect(loginFormSource).toContain('Kata sandi minimal 8 karakter')
expect(loginFormSource).toContain('Tampilkan kata sandi')
expect(loginFormSource).toContain('Sembunyikan kata sandi')
```

- [ ] **Step 4: Verify RED through CI**

Commit only the test change and let the PR workflow run.

Expected: `Client quality / Unit tests` fails because current `LoginPage.tsx` still contains `max-w-[1120px]`, `rounded-[22px]`, `shadow-raised`, and centered page padding, while `LoginHero.tsx` still contains inset margins and rounded card styling.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/__tests__/public-auth-design-contract.test.ts
git commit -m "test(client): define full-viewport login contract"
```

---

### Task 2: Convert the Page Shell to 45/55 Full Viewport

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`
- Test: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: `useAuth()`, `LoginHero`, `LoginForm`.
- Produces: one edge-to-edge login page with a responsive stack below `lg` and a 45/55 split at `lg` and above.

- [ ] **Step 1: Replace the outer shell**

Use this exact structural shape:

```tsx
<div className="min-h-screen bg-surface text-foreground">
  <main className="grid min-h-screen w-full lg:min-h-screen lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
    <LoginHero />

    <section className="flex min-h-[560px] items-center bg-surface px-6 py-10 sm:px-10 lg:min-h-screen lg:px-16 lg:py-12 xl:px-20">
      <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
    </section>
  </main>
</div>
```

This intentionally removes the centered-card elements: `max-w-[1120px]`, `overflow-hidden`, `rounded-[22px]`, `border border-border`, `shadow-raised`, `lg:place-items-center`, and desktop page inset padding.

- [ ] **Step 2: Confirm responsive semantics**

Below `lg`, the grid remains one column and the page can scroll naturally. At `lg`, both columns use `lg:min-h-screen` and fill the viewport height.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/login/LoginPage.tsx
git commit -m "refactor(client): make login shell full viewport"
```

---

### Task 3: Make the Visual Panel Edge-to-Edge

**Files:**
- Modify: `client/src/pages/login/components/LoginHero.tsx`
- Test: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Produces: the existing SOP visual identity as the full-height left side of the viewport.

- [ ] **Step 1: Remove nested-card styling**

Replace the current aside class with:

```tsx
className="relative min-h-[420px] overflow-hidden px-6 py-8 text-white sm:min-h-[480px] sm:px-8 sm:py-10 lg:min-h-screen lg:px-12 lg:py-12 xl:px-16 xl:py-14"
```

This removes `m-1.5`, `sm:m-2`, and `rounded-[18px]` while preserving the gradient and internal padding.

- [ ] **Step 2: Preserve the existing visual content exactly**

Do not change:
- `Portal Internal SOP`
- `Kelola SOP secara terstruktur dari penyusunan hingga arsip`
- `Biro Organisasi · Pemerintah Provinsi Sumatera Barat`
- `['Penyusunan', 'Evaluasi', 'Pengesahan', 'Arsip']`
- the existing radial/linear gradient values
- the asterisk and four outline workflow icons

- [ ] **Step 3: Keep content bottom-weighted**

Retain the `flex h-full flex-col` container and `mt-auto` content placement so the panel remains visually similar to the approved reference even when it becomes taller.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/login/components/LoginHero.tsx
git commit -m "refactor(client): extend login visual panel to viewport edges"
```

---

### Task 4: Verify, Review, and Merge

**Files:**
- No production changes unless verification finds a defect.

**Interfaces:**
- Validates the complete branch against UI contract, compilation, business journeys, and container build.

- [ ] **Step 1: Verify the focused contract is GREEN**

Required evidence from CI: `Client quality / Unit tests` completes successfully, including `public-auth-design-contract.test.ts`.

- [ ] **Step 2: Verify client quality**

Required CI steps:
- Typecheck: success
- E2E journey audit: success
- Lint: success
- Unit tests: success
- Build: success

- [ ] **Step 3: Verify repository-wide gates**

Required CI jobs:
- Minimal production config: success
- Server quality: success
- Database migration invariants: success
- Critical E2E business journeys J01-J07: success
- Container build: success

- [ ] **Step 4: Review the PR diff**

Confirm changed production code is limited to `LoginPage.tsx` and `LoginHero.tsx` unless a concrete layout defect required a minimal `LoginForm.tsx` adjustment. Confirm no auth API, DTO, store, route, backend, workflow, archive, or PDF code changed.

- [ ] **Step 5: Mark PR ready and squash merge**

Use PR title:

```text
refactor(client): make login full viewport
```

Merge only after the latest head CI concludes `success`. Use squash merge so the correction lands as one coherent commit on `main`.
