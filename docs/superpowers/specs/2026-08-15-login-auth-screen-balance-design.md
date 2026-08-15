# Balanced Login Auth Screen Design

## Problem

The current login page still feels like a secondary marketing page. The layout is not a true 1:1 split, the left panel contains too many explanatory blocks, and the form side repeats onboarding copy. This makes the screen feel busy and generic rather than calm, direct, and professional.

## Goal

Create a 50:50 login screen that feels like a polished institutional SaaS auth surface: minimal, not empty, visually grounded, and focused on signing in.

## Scope

In scope:
- Login page layout balance.
- Login left brand/visual panel.
- Login form framing and copy reduction.
- Source contract tests for the login design.

Out of scope:
- Authentication payload or behavior.
- API, DTO, backend, Prisma, session, roles, routes, permissions, archive fetching, workflow, or PDF validation.
- New external assets, libraries, animations, or decorative effects.

## Design Direction

Use a true 1:1 split at desktop width. The left half is a restrained institutional product panel. The right half is a clean form area. The page should not read like a brochure.

The left panel keeps brand identity and one strong product cue:
- SOPFlow and Biro Organisasi identification.
- A large, quiet visual card using the existing governor office image as atmosphere, not a captioned article image.
- One compact headline: `Pengelolaan SOP AP dalam satu alur kerja.`
- One small status pill: `Akses internal`.

The right panel keeps the form focused:
- Back link stays available but visually quiet.
- Form title becomes `Masuk`.
- Helper copy becomes one short sentence: `Gunakan akun yang telah didaftarkan administrator.`
- Keep email, password, show/hide password, validation messages, submit state, and payload unchanged.
- Help text becomes one short sentence: `Butuh bantuan? Hubungi administrator instansi.`

## Visual Rules

- Desktop grid must be `lg:grid-cols-2`.
- Avoid dense bullet lists, lifecycle cards, and long explanatory paragraphs.
- Avoid repeated icons that create noise.
- Keep surfaces clean with thin borders, restrained blue, and no glow/glassmorphism.
- Mobile must still show compact brand identity above the form.

## Testing

Update the existing public auth design contract to check that:
- Login page uses `lg:grid-cols-2`.
- Login page no longer uses asymmetric `1.08fr/0.92fr` columns.
- `LoginHero` contains the compact copy and does not contain the previous trust bullet/lifecycle arrays.
- `LoginForm` contains the short helper copy and does not contain the previous long administrator explanation.

## Acceptance Criteria

- Desktop login is visibly balanced 1:1.
- Left side is visual-first and low-copy.
- Right side is form-first and low-copy.
- Existing login behavior is unchanged.
- CI passes before merge.
