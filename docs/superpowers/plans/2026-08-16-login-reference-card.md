# Reference-Inspired Login Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current institutional service-portal login layout with the approved reference-inspired two-panel auth card while preserving authentication behavior.

**Architecture:** Keep the existing `LoginPage`, `LoginHero`, and `LoginForm` boundaries. `LoginPage` owns the page shell and two-column auth container, `LoginHero` owns the abstract blue SOP visual panel and workflow rail, and `LoginForm` owns form state, validation, password visibility, and submission.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, TanStack Router, Lucide React, Vitest source-contract tests, existing SOPFlow UI primitives.

## Global Constraints

- Frontend/UI-only.
- Use SOPFlow primary blue `#1D4ED8` and existing semantic tokens; no purple-heavy palette.
- A restrained gradient is allowed only on the left login visual panel.
- No new dependencies or external visual assets.
- No social login, social separator, or sign-up prompt.
- Preserve `await onSubmitLogin({ email, kataSandi: password })` exactly.
- Preserve existing validation strings, loading state, password toggle, route behavior, and post-login redirects.
- Preserve keyboard/focus accessibility.

---

## File Structure

- Modify `client/src/pages/__tests__/public-auth-design-contract.test.ts`: define the approved reference-inspired UI contract and auth guardrails.
- Modify `client/src/pages/login/LoginPage.tsx`: centered cohesive auth card, 45/55 desktop split, responsive stacking.
- Modify `client/src/pages/login/components/LoginHero.tsx`: abstract blue gradient panel, SOP copy, four-stage workflow rail.
- Modify `client/src/pages/login/components/LoginForm.tsx`: clean SaaS-style right panel, `Masuk ke sistem`, no social auth, preserved behavior.

---

### Task 1: Write the Reference-Inspired Login Contract

**Files:**
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: the three login source files through the existing `readSource` helper.
- Produces: source-contract expectations that fail against the current service-portal implementation.

- [ ] **Step 1: Replace the shell expectation with the approved integrated card contract**

Assert that `LoginPage.tsx` contains:

```ts
expect(loginPageSource).toContain('max-w-[1120px]')
expect(loginPageSource).toContain('lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]')
expect(loginPageSource).toContain('rounded-[22px]')
expect(loginPageSource).toContain('overflow-hidden')
expect(loginPageSource).not.toContain('lg:grid-cols-[minmax(0,7fr)_minmax(360px,5fr)]')
expect(loginPageSource).toContain('LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login}')
```

- [ ] **Step 2: Replace the hero expectation with the approved abstract SOP panel contract**

Assert that `LoginHero.tsx` contains:

```ts
expect(loginHeroSource).toContain('Portal Internal SOP')
expect(loginHeroSource).toContain('Kelola SOP secara terstruktur dari penyusunan hingga arsip')
expect(loginHeroSource).toContain('Biro Organisasi · Pemerintah Provinsi Sumatera Barat')
expect(loginHeroSource).toContain("['Penyusunan', 'Evaluasi', 'Pengesahan', 'Arsip']")
expect(loginHeroSource).toContain('linear-gradient')
expect(loginHeroSource).toContain('radial-gradient')
expect(loginHeroSource).not.toContain('Kantor_Gubernur_Sumbar_belakang.jpg')
```

- [ ] **Step 3: Replace the form expectation with the approved clean form contract**

Assert that `LoginForm.tsx` contains:

```ts
expect(loginFormSource).toContain('Masuk ke sistem')
expect(loginFormSource).toContain('Gunakan akun yang telah didaftarkan administrator.')
expect(loginFormSource).toContain('Kembali ke beranda')
expect(loginFormSource).toContain('Butuh bantuan? Hubungi administrator instansi.')
expect(loginFormSource).not.toContain('Akun internal')
expect(loginFormSource).not.toContain('Google')
expect(loginFormSource).not.toContain('Apple')
expect(loginFormSource).not.toContain('Daftar')
expect(loginFormSource).toContain('await onSubmitLogin({ email, kataSandi: password })')
expect(loginFormSource).toContain('Email wajib diisi')
expect(loginFormSource).toContain('Kata sandi minimal 8 karakter')
```

- [ ] **Step 4: Update the anti-slop guardrail**

Keep bans on `blur-3xl`, `shadow-xl`, `TTE BSRE`, `TTE BSrE`, and `Komdigi certified`, but remove the blanket `bg-gradient` ban because the approved left panel explicitly uses a restrained blue gradient.

- [ ] **Step 5: Run the focused test and verify RED**

Run:

```bash
pnpm --dir client test -- public-auth-design-contract.test.ts
```

Expected: FAIL because the current source still uses the 7:5 institutional layout, image-based hero, `Akses Internal SOPFlow`, `Masuk ke SOPFlow`, and no approved gradient panel.

- [ ] **Step 6: Commit the RED contract**

```bash
git add client/src/pages/__tests__/public-auth-design-contract.test.ts
git commit -m "test(client): define reference-inspired login contract"
```

---

### Task 2: Build the Integrated Auth Shell

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`

**Interfaces:**
- Consumes: `LoginHero`, `LoginForm`, `useAuth`.
- Produces: one centered rounded auth container with a 45/55 desktop split.

- [ ] **Step 1: Remove the separate desktop brand header from the page shell**

The page should render one cohesive auth object rather than an outer header plus two disconnected cards.

- [ ] **Step 2: Implement the centered shell**

Use this structural shape:

```tsx
<div className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-foreground sm:px-6 lg:grid lg:place-items-center lg:py-10">
  <main className="mx-auto grid w-full max-w-[1120px] overflow-hidden rounded-[22px] border border-border bg-surface shadow-raised lg:min-h-[620px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <LoginHero />
    <section className="flex items-center bg-surface px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
      <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
    </section>
  </main>
</div>
```

- [ ] **Step 3: Keep the shell responsive**

The grid is one column below `lg`; the panel order remains hero then form; no horizontal overflow.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/login/LoginPage.tsx
git commit -m "refactor(client): integrate login card shell"
```

---

### Task 3: Build the Approved Left Visual Panel

**Files:**
- Modify: `client/src/pages/login/components/LoginHero.tsx`

**Interfaces:**
- Produces visible copy `Portal Internal SOP`, `Kelola SOP secara terstruktur dari penyusunan hingga arsip`, `Biro Organisasi · Pemerintah Provinsi Sumatera Barat`, and stages `Penyusunan`, `Evaluasi`, `Pengesahan`, `Arsip`.

- [ ] **Step 1: Remove the photo import and old service-card content**

Delete the `Kantor_Gubernur_Sumbar_belakang.jpg` import and all photo/figure markup.

- [ ] **Step 2: Add workflow metadata and Lucide outline icons**

Use exactly these stages:

```ts
const workflowSteps = ['Penyusunan', 'Evaluasi', 'Pengesahan', 'Arsip']
```

Map them to compact outline icons from `lucide-react` such as `FileText`, `ClipboardCheck`, `Stamp`, and `Archive`.

- [ ] **Step 3: Implement the restrained blue layered background**

Use inline style so the approved gradient is explicit and scoped:

```tsx
style={{
  backgroundImage:
    'radial-gradient(circle at 78% 12%, rgba(219,234,254,0.9) 0%, rgba(219,234,254,0) 34%), radial-gradient(circle at 72% 58%, rgba(147,197,253,0.55) 0%, rgba(147,197,253,0) 38%), linear-gradient(145deg, #60a5fa 0%, #2563eb 42%, #1d4ed8 68%, #0f3a9a 100%)',
}}
```

No purple stops and no blur utilities.

- [ ] **Step 4: Add the top accent and bottom-weighted content**

Use a simple CSS/HTML asterisk mark near the top. Place the SOP eyebrow, large white headline, institution line, and workflow rail toward the lower half, mirroring the approved reference hierarchy.

- [ ] **Step 5: Keep mobile readable**

Use a smaller minimum height and headline on mobile, increasing at `lg`. Keep the workflow rail wrapping or using a two-column mobile grid so labels remain readable.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/login/components/LoginHero.tsx
git commit -m "refactor(client): add SOP visual login panel"
```

---

### Task 4: Refine the Clean Right-Side Login Form

**Files:**
- Modify: `client/src/pages/login/components/LoginForm.tsx`

**Interfaces:**
- Must preserve `onSubmitLogin({ email, kataSandi: password })`, validation, loading state, and password visibility behavior.
- Produces heading `Masuk ke sistem` and support copy without social auth.

- [ ] **Step 1: Keep the back action but simplify the header**

Retain the existing `Kembali ke beranda` action. Remove the `Akun internal` chip and replace the large form heading with:

```tsx
<h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-[34px]">
  Masuk ke sistem
</h1>
<p className="mt-2.5 text-sm leading-6 text-secondary-foreground">
  Gunakan akun yang telah didaftarkan administrator.
</p>
```

Add a small primary-blue accent mark above the title.

- [ ] **Step 2: Keep existing field state and validation unchanged**

Do not change the state variables, `validateForm`, `handleSubmit`, payload, auto-complete attributes, or password visibility ARIA labels.

- [ ] **Step 3: Polish field rhythm and CTA**

Use slightly more vertical separation between fields, a full-width `h-11` primary button, and existing Input/Label primitives.

- [ ] **Step 4: Keep one concise help row**

Render exact copy:

```tsx
<p className="mt-7 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
  Butuh bantuan? Hubungi administrator instansi.
</p>
```

Do not add social auth, social dividers, or sign-up copy.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/login/components/LoginForm.tsx
git commit -m "refactor(client): polish reference-style login form"
```

---

### Task 5: Verify and Prepare Merge

**Files:**
- No production changes unless verification finds a defect.

- [ ] **Step 1: Run focused source-contract test**

```bash
pnpm --dir client test -- public-auth-design-contract.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run client typecheck**

```bash
pnpm --dir client typecheck
```

Expected: PASS.

- [ ] **Step 3: Run client build**

```bash
pnpm --dir client build
```

Expected: PASS.

- [ ] **Step 4: Review the branch diff**

Confirm only the login UI, its source-contract test, and the approved spec/plan changed. Confirm no auth API, DTO, route, store, backend, workflow, archive, or PDF validation changes.

- [ ] **Step 5: Open a PR and verify GitHub checks**

PR title:

```text
refactor(client): align login with approved reference
```

The PR body must state that auth behavior is unchanged and the left-panel gradient is a login-only user-approved exception.

- [ ] **Step 6: Merge after checks pass**

Use squash merge so the UI iteration lands as one coherent main-branch change.