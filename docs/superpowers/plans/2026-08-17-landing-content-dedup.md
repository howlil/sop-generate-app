# Landing Page Content Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant landing-page navigation, messaging, static mock metrics, and repeated sections while preserving the existing visual design.

**Architecture:** Keep the current landing component boundaries and TanStack Router routes. Simplify composition in `LandingPage.tsx`, trim copy and repeated CTA blocks inside existing landing components, and preserve current styling classes unless a class becomes unused because its content is removed.

**Tech Stack:** React, TypeScript, TanStack Router, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Landing page only; no authenticated application UI changes.
- Preserve existing colors, spacing system, typography treatment, card shapes, shadows, and responsive behavior.
- No new dependencies or data fetching.
- Prefer factual administrative copy; avoid generic SaaS slogans.
- Do not present static mock values as operational statistics.

---

### Task 1: Define the landing regression contract

**Files:**
- Modify: `client/src/pages/landing/__tests__/landing-visual-layout.test.tsx`

**Interfaces:**
- Consumes: existing landing components.
- Produces: regression coverage for centered hero and removal of duplicate content.

- [ ] Add tests that render the relevant landing components and assert duplicate header links, trust-cue copy, static metrics, repeated footer navigation, and removed slogans are absent.
- [ ] Keep the existing centered-hero and product-preview regression expectations.
- [ ] Run the targeted Vitest file and verify the new assertions fail before implementation.

### Task 2: Simplify composition and workflow storytelling

**Files:**
- Modify: `client/src/pages/LandingPage.tsx`
- Modify: `client/src/pages/landing/workflow-story.tsx`

**Interfaces:**
- Consumes: `WORKFLOW_STAGES` and existing `WorkflowStory`.
- Produces: one seven-step workflow section without the repeated three-chapter narrative and without `DocumentTraceability` in page composition.

- [ ] Remove the `DocumentTraceability` import and render call from `LandingPage.tsx`.
- [ ] Remove `WORKFLOW_CHAPTERS` and the chapter prop from `WorkflowStory`.
- [ ] Keep the existing seven-stage visual timeline and section surface unchanged.

### Task 3: Remove repeated navigation and hero marketing copy

**Files:**
- Modify: `client/src/pages/landing/public-header.tsx`
- Modify: `client/src/pages/landing/identity-hero.tsx`
- Modify: `client/src/pages/landing/landing-product-preview.tsx`

**Interfaces:**
- Produces: concise public navigation, centered hero, and product preview without fake operational metrics.

- [ ] Header keeps Arsip SOP, Validasi PDF, and Masuk; remove in-page Alur kerja and Peran navigation.
- [ ] Shorten hero supporting copy, preserve current heading, CTA layout, and centered visual composition.
- [ ] Remove hero trust cues and repeated government/office line below the CTAs.
- [ ] Remove the static `metrics` row from the product preview while keeping the surrounding preview card and lifecycle area.

### Task 4: Simplify role, closing, and footer content

**Files:**
- Modify: `client/src/pages/landing/role-workspace-showcase.tsx`
- Modify: `client/src/pages/landing/institutional-closing.tsx`
- Modify: `client/src/pages/landing/public-footer.tsx`

**Interfaces:**
- Produces: one concise role explanation surface, one closing login CTA, and a non-duplicative institutional footer.

- [ ] Keep the role tabs and outer panel visual treatment; remove the secondary mock workspace preview and make the selected role information occupy the existing panel cleanly.
- [ ] Replace “Satu sistem. Lima konteks kerja.” with direct copy about five user roles and their responsibilities.
- [ ] Keep InstitutionalClosing image/surface/spacing, replace the slogan/lifecycle copy with direct institutional wording, and keep only the login CTA.
- [ ] Remove footer navigation while preserving logo, institution, descriptive line, and copyright.

### Task 5: Verify

**Files:**
- Test: `client/src/pages/landing/__tests__/landing-visual-layout.test.tsx`

- [ ] Run the targeted landing test file.
- [ ] Run client typecheck/lint/test commands available in `client/package.json` that cover the modified files.
- [ ] Review the branch diff to confirm no unrelated UI or route behavior changed.
- [ ] Check GitHub commit status/workflow results if available.