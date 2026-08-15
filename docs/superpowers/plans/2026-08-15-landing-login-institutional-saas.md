# Landing + Login Institutional SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign SOPFlow public landing and login into a clean institutional SaaS surface that is product-first, government-credible, and free of overdecorated AI-template styling.

**Architecture:** Keep the current React/Tailwind route structure and replace only presentational landing/login components. The landing hero becomes a light product-first composition with a local product preview component; login keeps existing auth behavior while changing the surrounding trust panel and form-card presentation.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Router, Tailwind CSS utility classes, Vitest source-contract tests, existing local image and logo assets.

## Status

Implemented in PR #37 through focused frontend commits. CI is the source of truth before merge.

## Global Constraints

- Frontend/UI-only.
- No backend/API/DTO/Prisma changes.
- No authentication behavior changes.
- No route or permission changes.
- No new external assets or libraries.
- No change to actual PDF validation, archive fetching, or SOP workflow logic.
- No broad design-system refactor beyond what the touched landing/login components need.
- Preserve existing login submit payload: `{ email, kataSandi: password }`.
- Preserve existing show/hide password control and field validation behavior.
- Avoid `bg-gradient`, `blur-3xl`, `shadow-xl`, and `rounded-3xl` in touched landing/login components.
- Do not add claims about BSrE/Komdigi certification.

## Implemented Tasks

- [x] Update landing design contract.
- [x] Add `LandingProductPreview`.
- [x] Refactor landing hero into light product-first composition.
- [x] Lighten public navigation.
- [x] Refactor login left panel into an institutional trust/product panel.
- [x] Frame login form as a clean enterprise card while preserving auth behavior.
- [x] Update public auth design contract.

## Verification

Run through CI before merge:

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Critical E2E business journeys remain required through GitHub Actions before merging to `main`.
