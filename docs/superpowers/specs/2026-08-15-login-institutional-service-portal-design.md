# Login Institutional Service Portal Redesign

Date: 2026-08-15
Branch: `refactor/login-institutional-service-portal`
Target: SOPFlow login page

## Problem

The current login screen still reads as generated SaaS marketing: a large photo card, dark overlay, oversized headline, floating form card, and scattered explanatory copy. It does not feel like a mature internal government service portal.

The next redesign must make the login page look more official, more task-focused, and less decorative while keeping enough visual identity to avoid a plain form-only page.

## Chosen direction

Use **Institutional Service Portal**.

This direction combines:
- government service clarity: direct access, low copy, task-first layout;
- enterprise SaaS polish: controlled surfaces, tighter spacing, refined form affordances;
- local institutional identity: photo or regional motif as an accent, not the dominant billboard.

## Design goals

1. Remove the current AI-template feeling.
2. Replace the photo billboard with a controlled service identity panel.
3. Keep the login task visually dominant and easy to scan.
4. Keep copy sparse and specific.
5. Preserve authentication behavior exactly.

## Desktop layout

Use a centered shell instead of a full-height split poster.

Proposed structure:

```text
Header bar
┌────────────────────────────────────────────────────────────┐
│ SOPFlow · Biro Organisasi Provinsi Sumatera Barat   Beranda │
└────────────────────────────────────────────────────────────┘

Main shell
┌──────────────────────────────────┐ ┌──────────────────────┐
│ Akses Internal SOPFlow            │ │ Masuk ke SOPFlow     │
│ Pengelolaan SOP AP                │ │                      │
│ dari evaluasi hingga arsip.       │ │ Email                │
│                                  │ │ Kata sandi           │
│ Draft → Evaluasi → BA → Arsip     │ │ [ Masuk ]            │
│                                  │ │                      │
│ Controlled photo / product accent │ │ Bantuan administrator│
└──────────────────────────────────┘ └──────────────────────┘
```

Recommended desktop grid:
- max width: 1120–1200px;
- left panel: slightly larger than right, around 7:5;
- right form: fixed comfortable width inside its column;
- layout vertically centered but not poster-like;
- avoid large empty halves.

## Left service panel

Replace the current large photo + dark overlay with a calmer identity card:

- top label: `AKSES INTERNAL`;
- title: `Pengelolaan SOP AP dari evaluasi hingga arsip.`;
- workflow row: `Draft`, `Evaluasi`, `Berita Acara`, `Arsip`;
- optional small institutional image crop inside a framed card, not as a full-width billboard;
- no long paragraph;
- no trust bullet arrays;
- no lifecycle explanation paragraph.

The left panel should look like a compact service cover, not an advertisement.

## Right login panel

Use a quieter form surface:

- title: `Masuk ke SOPFlow`;
- subcopy: `Gunakan akun yang telah didaftarkan administrator.`;
- fields remain unchanged semantically;
- button label remains `Masuk`;
- support copy: `Butuh bantuan? Hubungi administrator instansi.`;
- remove decorative dividers unless needed for spacing;
- reduce excessive blank vertical space.

## Visual style

- Background: warm off-white or very light blue-gray.
- Header: white or subtle translucent surface with bottom border.
- Left panel: muted deep navy/blue-gray surface or white card with restrained blue accents.
- Right panel: white surface with border, very soft shadow, no dramatic floating effect.
- Radius: consistent, less pill-like.
- Typography: smaller and denser than the current screenshot.
- Button: solid blue, mature, no gradient, no heavy shadow.

## Mobile layout

Mobile keeps the form first or nearly first:

1. compact brand header;
2. login form;
3. service identity panel below or simplified away.

Do not force users to scroll past a large image before login.

## Scope

In scope:
- `LoginPage` layout;
- `LoginHero`/left panel presentation;
- `LoginForm` typography and support copy presentation;
- source-contract tests for low-copy, portal-style layout.

Out of scope:
- backend;
- API payloads;
- auth service;
- validation schema;
- route names;
- roles and permissions;
- session handling;
- password visibility behavior;
- landing page changes;
- new external assets or libraries.

## Acceptance criteria

- Desktop login no longer uses a full-height marketing split or large billboard photo.
- Page has a top service header and centered portal shell.
- Left side reads as a controlled institutional service panel.
- Right side remains clearly the login task.
- Copy is sparse: no trust bullet arrays, no lifecycle explanation paragraph, no marketing paragraph.
- Existing auth behavior is preserved.
- Client source-contract tests cover the new portal-style constraints.
- CI passes before merge.
