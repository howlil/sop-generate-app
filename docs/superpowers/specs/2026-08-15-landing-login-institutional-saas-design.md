# Landing + Login Institutional SaaS Redesign

## Context

Current public landing and login surfaces were credible but still felt split between a dark institutional poster and an internal admin screen. The landing hero used a large dark navy section with the government building as the dominant visual. The login page also used a dark visual panel, while the form area was functional but not yet shaped as a polished enterprise SaaS authentication surface.

This iteration redesigns the public landing hero and login experience into a clean institutional SaaS style: modern, product-first, restrained, and appropriate for a government SOP management system.

## Goals

1. Make the landing page feel like a serious SaaS product, not an institutional profile page.
2. Keep government credibility without letting the building photo dominate the product story.
3. Make the product workflow immediately understandable: draft, evaluation, correction, berita acara, approval, archive, validation.
4. Make login feel like an enterprise admin portal: calm, fast, and trustworthy.
5. Avoid AI-slop patterns: excessive glow, fake gradients, random cards, decorative noise, or over-stylized mockups.

## Non-goals

- No backend/API/DTO/Prisma changes.
- No authentication behavior changes.
- No route or permission changes.
- No new external assets or libraries.
- No change to actual PDF validation, archive fetching, or SOP workflow logic.
- No broad design-system refactor beyond what the touched landing/login components need.

## Design Direction

The visual direction is **clean institutional SaaS**:

- Light-first surface, using off-white and white cards.
- Deep navy/slate for text and credibility.
- Blue as a precise action/accent color, not a decorative flood.
- Product UI mockups as the main hero visual.
- Government building image as a secondary identity accent.
- Thin borders, disciplined spacing, and restrained shadows.

Reference qualities:

- Linear-like restraint and product-first storytelling.
- Vercel-like navigation and CTA discipline.
- Stripe-like section rhythm.
- Notion-like scannable information hierarchy.

## Implemented Scope

- Landing hero was moved to a light product-first composition.
- A static `LandingProductPreview` now presents the SOPFlow workflow, status, archive, and validation story.
- Public header was moved away from full dark treatment.
- Login left panel was converted into a light trust/product panel.
- Login form is now framed as a clean enterprise card while preserving submit payload and validation behavior.
- Source-contract tests were updated for the new landing and login direction.

## Acceptance Criteria

- Landing no longer uses a full dark poster hero as the primary first impression.
- Hero is product-first with a workbench-style preview.
- Government building image is retained only as a supporting identity accent.
- Headline changes to `Kelola SOP dari draft hingga berlaku dalam satu alur kerja.`
- CTAs remain available: login and archive.
- Role section remains available with role-based workspace previews.
- Workflow and archive/validation value remain visible without logging in.
- Login page uses an enterprise two-column layout with a clean form card and trust panel.
- Existing auth behavior is unchanged.
- No backend/API/Prisma/workflow/permission changes.
- CI is green before merge.
