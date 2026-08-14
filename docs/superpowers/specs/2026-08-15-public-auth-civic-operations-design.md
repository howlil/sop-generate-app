# Public Auth Civic Operations Design

## Intent

Redesign the public landing page and login page as a coherent government operations product experience. The public surface must feel modern and substantial without using generic AI/SaaS decoration, while remaining consistent with the compact authenticated application.

## Design direction

Use a **Civic Operations Platform** visual language: institutional identity, editorial composition, real workflow visualization, restrained photography, thin rules, compact metadata, and border-led product surfaces. Richness must come from layout and domain information rather than gradients, glassmorphism, glow, oversized rounded cards, fake metrics, or decorative floating objects.

## Shared visual rules

- Keep Inter and the existing semantic theme tokens.
- Primary blue remains `#1D4ED8`; semantic green/warning/red are status-only.
- Add deep navy only as an institutional large surface; do not introduce a new rainbow palette.
- Controls use the existing 6px control radius; large surfaces normally use 8px and may use 12px sparingly.
- Default to borders and tonal background changes; large shadows are prohibited.
- Landing display typography may exceed dashboard typography, but desktop hero headings should stay around 48–56px rather than the current ~72px.
- Photography must use the existing Kantor Gubernur image as institutional context, not as a full-page marketing background.
- Product previews must represent the real SOP domain instead of invented analytics.
- Motion is limited to state/reveal behavior; no floating, glowing, scale-heavy decoration.

## Landing page

### Header

Use a stable white institutional header with the logo, `APP_DISPLAY_NAME`, a small `Pemerintah Provinsi Sumatera Barat · Biro Organisasi` identity line, public navigation anchors, and a clear `Masuk` action. Do not switch between transparent and solid header themes on scroll.

### Hero

Use an asymmetric two-column composition. The left side explains the system in concrete language and exposes the primary internal action plus public archive link. The right side combines a restrained architectural crop of Kantor Gubernur with one realistic workflow surface showing an example SOP moving through the actual lifecycle.

Do not display fake counts or percentages. The workflow preview is illustrative and must be visibly framed as a product preview rather than current live data.

### Public utilities

Place `Arsip SOP` and `Validasi PDF` immediately after the hero as two task-oriented surfaces. These are public utilities, not marketing feature cards.

### Institutional identity strip

Show the responsible institution and the managed process scope in a compact horizontal strip to strengthen context and trust.

### Workflow

Represent the real lifecycle as a horizontal process rail on desktop and stacked flow on small screens:

`Penyusunan → Pengajuan → Evaluasi → Perbaikan → Berita Acara → Pengesahan → Arsip`.

Accompany it with one realistic document/evaluation panel instead of a grid of multi-colored gradient cards.

### Roles

Use a role explorer with a compact selector and one detail workspace. Include Penyusun, PJ Penyusun, Evaluator, PJ Evaluator Organisasi, and Kepala OPD. Avoid animated carousel cards, role-specific theme colors, and feature pills.

### Integrity / traceability

Use one editorial section to explain version history, evaluation notes, status history, archive, and validation. Do not claim external certification that the implementation does not provide.

### Final access band and footer

Use a restrained institutional access section with internal login and public utility links. No gradient CTA banner.

## Login page

Use a 60/40 desktop composition. The left institutional panel uses deep navy, the application and institution identity, the real SOP lifecycle, and a restrained architectural image crop. The right panel is a focused white authentication surface.

The form keeps existing auth behavior and validation. Use the heading `Masuk ke sistem` and explain that the user should use an account registered by the administrator. Keep password visibility affordance. Remove decorative mail/lock icons and large marketing language.

## Domain accuracy

The implementation must not state that the application provides certified BSrE/Komdigi signing. `docs/requirements.md` says application TTE is a simulation and optional PDF PKCS#7 uses an internal certificate. Public copy should therefore use neutral wording such as `pengesahan elektronik internal`, `tanda tangan elektronik internal`, `validasi dokumen`, or simply `pengesahan` where sufficient.

## Behavior constraints

- Do not change auth API calls, DTOs, redirects, or login validation behavior.
- Do not change public archive or PDF validation routes.
- Do not change backend code, permissions, workflow transitions, or persisted data.
- Preserve responsive behavior and keyboard/focus accessibility.
- Continue using `APP_DISPLAY_NAME` instead of hardcoding a new product brand.
