# Landing + Login Institutional SaaS Redesign

## Context

Current public landing and login surfaces are credible but still feel split between a dark institutional poster and an internal admin screen. The landing hero currently uses a large dark navy section with the government building as the dominant visual. The login page also uses a dark visual panel, while the form area is functional but not yet shaped as a polished enterprise SaaS authentication surface.

This iteration will redesign the public landing hero, role/workflow presentation, and login experience into a clean institutional SaaS style: modern, product-first, restrained, and appropriate for a government SOP management system.

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

## Landing Navigation

The navigation should remain simple but more mature:

- Left: logo, `SOPFlow`, and compact institutional subtitle.
- Right: `Alur kerja`, `Peran`, `Arsip SOP`, `Validasi PDF`, and primary `Masuk` action.
- Header height around 64-72px.
- Use a light or translucent surface that matches the new landing direction.
- Avoid tiny, low-contrast nav text.

## Hero Section

### Layout

Replace the dark poster layout with a product-first hero:

- Left column: eyebrow, headline, supporting text, CTA, trust cues.
- Right column: product preview composition.
- Building photo moves from dominant full-height image to a smaller identity accent card or background insert inside the product visual composition.

### Copy

Preferred headline:

> Kelola SOP dari draft hingga berlaku dalam satu alur kerja.

Supporting copy:

> SOPFlow membantu OPD, penyusun, evaluator, PJ evaluator, dan kepala OPD bekerja dalam satu proses terdokumentasi — dari penyusunan, evaluasi, perbaikan, berita acara, pengesahan, hingga arsip final.

CTA structure:

- Primary: `Masuk ke Sistem`
- Secondary: `Lihat Arsip SOP`

Trust cues below CTA:

- `Berbasis peran`
- `Evaluasi terdokumentasi`
- `Arsip dan validasi terpusat`

### Product Visual

The hero visual should look like a real product preview, not a generic mockup. It should include a simplified workbench preview:

- A compact header: `Pengajuan Evaluasi`
- Institution/context line: e.g. `Dinas Kesehatan Provinsi · 4 SOP`
- A lifecycle strip: `Draft → Evaluasi → BA → Pengesahan → Arsip`
- A document row or preview card with status: `Menunggu TTD PJ Evaluator`
- A small validation/archive card.
- A small building photo accent labelled as institutional identity.

The visual should be made with local React/Tailwind markup and existing assets only.

## Role Section

The current `Satu sistem. Lima konteks kerja.` concept should stay, but the section should become a polished role workbench rather than a wireframe-like preview.

### Structure

- Eyebrow: `RUANG KERJA BERBASIS PERAN`
- Title: `Satu sistem. Lima konteks kerja.`
- Short explanation on the right.
- Refined role tabs with quiet underline active state.
- Two-column content:
  - Left: role context, main responsibilities, key outcome.
  - Right: realistic product preview for the selected role.

### Role Preview Content

Each role should feel connected to actual SOPFlow workflows:

- `Penyusun`: draft SOP, pelaksana, prosedur, peraturan, revision history.
- `PJ Penyusun`: coordination, submission readiness, revision follow-up.
- `Evaluator`: assessment, notes, recommendation, status movement.
- `PJ Evaluator Organisasi`: multi-SOP review, berita acara, approval preparation.
- `Kepala OPD`: pengesahan, signed SOP, archive readiness.

## Workflow Section

Add or refine a concise workflow section after the role section:

1. OPD menyusun draft SOP.
2. Pengajuan masuk ke Biro Organisasi.
3. Evaluator memberi catatan dan penilaian.
4. Berita acara ditandatangani.
5. Kepala OPD mengesahkan.
6. SOP masuk arsip publik.

Use a clean horizontal timeline or compact 3x2 card grid. Avoid icon noise.

## Archive + Validation Section

Add a compact credibility section for public access:

- Archive search preview.
- PDF validation result preview.
- Copy: `Arsip dan validasi dokumen dalam satu tempat.`

This section should clarify that the public side is not only a login gate; it also supports SOP discovery and document validation.

## Login Page

### Layout

Keep two columns on desktop, but make it calmer and more enterprise:

- Left: trust/product panel.
- Right: login card.

The left panel should not be a dark poster. It should use a light institutional surface with:

- Logo and institution label.
- Short headline about secure role-based access.
- Three trust bullets:
  - `Akses berbasis peran`
  - `Evaluasi terdokumentasi`
  - `Arsip SOP terpusat`
- Small product preview card, not a large building photo.
- Optional small building image accent.

The right form should sit in a clean card:

- White surface.
- Thin border.
- Comfortable spacing.
- Strong title: `Masuk ke SOPFlow` or `Masuk ke sistem`.
- Short helper text.
- Email and password fields.
- Existing show/hide password behavior preserved.
- Existing validation behavior preserved.
- Existing submit behavior preserved.

### Mobile

On mobile:

- Hide large trust panel.
- Show compact brand header above the form.
- Keep form full-width with enough padding.
- Preserve accessibility and focus states.

## Component Strategy

Create small presentational components where useful, but avoid over-engineering:

- `LandingProductPreview` for the hero mockup.
- `LandingTrustCue` or inline trust cue list if small enough.
- `LoginTrustPanel` or reuse `LoginHero` after renaming only if necessary.

Keep existing route structure and imports intact.

## Testing Strategy

Use focused tests instead of snapshot-heavy visual tests:

1. Landing contract test checks:
   - preferred headline exists;
   - primary and secondary CTAs exist;
   - product preview labels exist;
   - building photo is not the only hero visual;
   - role section still exposes all roles;
   - archive/validation section is present.

2. Login contract test checks:
   - login title/helper exists;
   - email/password controls remain accessible;
   - show/hide password control remains accessible;
   - trust bullets exist;
   - submit button still says `Masuk` when idle.

3. Existing CI remains the integration proof:
   - client typecheck;
   - lint;
   - unit tests;
   - build;
   - critical E2E business journeys.

## Acceptance Criteria

- Landing no longer uses a full dark poster hero as the primary first impression.
- Hero is product-first with a workbench-style preview.
- Government building image is retained only as a supporting identity accent.
- Headline changes to `Kelola SOP dari draft hingga berlaku dalam satu alur kerja.`
- CTAs remain available: login and archive.
- Role section looks like a polished role workbench, not a wireframe.
- Workflow and archive/validation value are visible without logging in.
- Login page uses an enterprise two-column layout with a clean form card and trust panel.
- Existing auth behavior is unchanged.
- No backend/API/Prisma/workflow/permission changes.
- CI is green before merge.

## Implementation Order

1. Add or update landing design contract tests.
2. Refactor hero into light product-first composition.
3. Polish role section and product preview states.
4. Add or refine workflow and archive/validation sections.
5. Add or update login design contract tests.
6. Refactor login hero/trust panel and form card styling.
7. Open draft PR and let CI validate.
