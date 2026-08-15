# Balanced Login Auth Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the login screen into a true 50:50 low-copy institutional SaaS auth surface.

**Architecture:** Keep the existing `LoginPage`, `LoginHero`, and `LoginForm` component boundaries. Adjust only presentation and source-contract tests. Preserve auth state, payload, validation, and routing behavior.

**Tech Stack:** React, TypeScript, Tailwind utility classes, existing UI primitives, Vitest source-contract tests.

## Global Constraints

- Frontend/UI-only.
- Do not change backend, API, DTO, Prisma, auth payload, login submission behavior, route behavior, role handling, permissions, workflow, archive fetching, or PDF validation.
- Do not add external assets, libraries, new animations, or decorative glow/glassmorphism.
- Desktop login layout must be `lg:grid-cols-2`.
- Keep the screen low-copy: no trust bullet arrays, no lifecycle array, no long explanatory paragraphs.

---

### Task 1: RED contract for balanced login screen

**Files:**
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes current source files as strings.
- Produces test expectations for `LoginPage.tsx`, `LoginHero.tsx`, and `LoginForm.tsx`.

- [ ] **Step 1: Update the failing test**

Add expectations that require:

```ts
expect(loginPage).toContain('lg:grid-cols-2')
expect(loginPage).not.toContain('lg:grid-cols-[1.08fr_0.92fr]')
expect(loginHero).toContain('Pengelolaan SOP AP dalam satu alur kerja.')
expect(loginHero).toContain('Akses internal')
expect(loginHero).not.toContain('trustBullets')
expect(loginHero).not.toContain('lifecycle')
expect(loginForm).toContain('Gunakan akun yang telah didaftarkan administrator.')
expect(loginForm).not.toContain('Akses dan menu akan mengikuti peran pengguna')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`

Expected: FAIL because layout/copy still uses old longer version.

- [ ] **Step 3: Commit RED contract**

Commit message: `test(client): require balanced login auth screen`

---

### Task 2: Implement 50:50 layout and low-copy left panel

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`
- Modify: `client/src/pages/login/components/LoginHero.tsx`

**Interfaces:**
- `LoginPage` still renders `LoginHero` and `LoginForm`.
- `LoginHero` remains prop-less.

- [ ] **Step 1: Change desktop layout**

Set root layout to `lg:grid lg:grid-cols-2` and keep mobile brand identity above the form.

- [ ] **Step 2: Simplify `LoginHero`**

Remove `trustBullets`, `lifecycle`, and most icons. Keep existing image and logo. Render a quiet visual-first left panel with compact brand, large image/card, headline `Pengelolaan SOP AP dalam satu alur kerja.`, and one `Akses internal` pill.

- [ ] **Step 3: Commit layout and hero**

Commit message: `refactor(client): simplify login visual panel`

---

### Task 3: Simplify form copy and framing

**Files:**
- Modify: `client/src/pages/login/components/LoginForm.tsx`

**Interfaces:**
- `LoginFormProps` unchanged.
- `onSubmitLogin({ email, kataSandi: password })` unchanged.
- Email/password validation unchanged.

- [ ] **Step 1: Shorten form header**

Use title `Masuk` and helper `Gunakan akun yang telah didaftarkan administrator.`

- [ ] **Step 2: Shorten help text**

Use `Butuh bantuan? Hubungi administrator instansi.`

- [ ] **Step 3: Commit form copy**

Commit message: `refactor(client): reduce login form copy`

---

### Task 4: Verify and open PR

**Files:**
- No source changes unless CI fails.

- [ ] **Step 1: Run source-contract test**

Run: `pnpm --dir client test -- public-auth-design-contract.test.ts`

Expected: PASS.

- [ ] **Step 2: Run CI via PR**

Open PR as draft, wait for CI. If any job fails, inspect logs and patch only the failing issue.

- [ ] **Step 3: Merge when green**

When Client quality, Critical E2E, and Container build pass, mark ready and squash merge.
