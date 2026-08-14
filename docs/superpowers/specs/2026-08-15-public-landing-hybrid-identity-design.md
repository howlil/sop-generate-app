# Public Landing Redesign — Hybrid Identity-First Civic Tech

Date: 2026-08-15
Status: Approved design direction, pending implementation plan
Scope: Public landing page only
Repository: `howlil/sop-generate-app`

## 1. Objective

Redesign the current public landing page so it feels substantially more distinctive, premium, and visually memorable while preserving the credibility expected from a provincial government service.

The target is not a startup marketing template and not a traditional government portal. The design should feel like a modern civic technology product with a strong institutional identity.

Chosen direction:

- Hybrid editorial government × modern product storytelling
- Identity-first hero
- Product-heavy middle sections
- Strong visual rhythm through scale, composition, photography, and large solid color fields
- No decorative AI-style visual effects

The landing page should communicate two ideas immediately:

1. This is an official operational system associated with Pemerintah Provinsi Sumatera Barat / Biro Organisasi.
2. This is a modern software product that manages a real, structured SOP lifecycle.

## 2. Problem With the Current Version

The current landing page is correct, clean, and consistent with the internal dashboard design system, but it is visually too conservative for a public-facing landing page.

Current weaknesses:

- Repeated `max-w-6xl` centered containers produce a predictable page rhythm.
- Most sections are bordered white or light-neutral panels.
- The hero uses a conventional text-left / preview-right split.
- The government building photograph is visually muted instead of becoming a signature asset.
- Workflow information is presented as seven equal boxes, so every stage has similar visual weight.
- Public service links are two symmetric cards.
- Role content behaves like a settings panel rather than a product showcase.
- The page lacks a visual climax and a memorable closing section.

The redesign must not solve this by adding gradients, glowing orbs, excessive shadows, random floating cards, or decorative animation. The solution is stronger composition and storytelling.

## 3. Visual Personality

The intended personality is:

- authoritative
- modern
- regional but restrained
- operational
- editorial
- technical without feeling futuristic
- premium without luxury styling

Primary visual language:

- deep institutional navy
- white / warm neutral surfaces
- primary blue accents
- controlled semantic status colors
- architectural photography
- large typography
- thin structural lines
- document and workflow geometry

Approximate page-level color ratio:

- 55–60% white / warm-neutral surfaces
- 25–30% deep navy
- 10–15% primary blue and blue-tinted surfaces
- semantic green/orange/red only for meaningful states

No purple is needed on the landing page.

## 4. Global Guardrails

The following are explicit anti-patterns and should not appear in the implementation:

- no glassmorphism
- no blur blobs or glow orbs
- no decorative gradient mesh backgrounds
- no rainbow role colors
- no large soft shadows as the main hierarchy mechanism
- no `rounded-3xl` / excessive pill styling
- no fake statistics or fake adoption metrics
- no fictional government certifications
- no BSrE or Komdigi certification claim
- no repeated floating cards with no product meaning
- no infinite floating/bouncing animation
- no overuse of icons as decoration
- no traditional government-event poster aesthetic
- no giant batik/songket pattern wallpaper

Use at most two practical radius levels consistent with the existing system.

## 5. Page Rhythm

The redesigned landing should intentionally alternate scale and surface treatment.

Final page sequence:

1. Institutional identity-first hero
2. Asymmetric public services
3. Editorial workflow storytelling
4. Large role-based workspace showcase
5. Full-dark document traceability signature section
6. Institutional closing image + CTA
7. Formal compact footer

This replaces the current repeating pattern of bordered card → bordered card → panel → panel.

## 6. Header

The public header remains compact and formal, but should visually integrate with the identity-first hero.

Desktop content:

- official logo / identity block on the left
- `Pemerintah Provinsi Sumatera Barat`
- `Biro Organisasi`
- navigation anchors for workflow and roles where useful
- `Arsip SOP`
- `Validasi PDF`
- primary `Masuk`

Guidelines:

- avoid a large marketing navbar
- no glass/blur treatment
- no oversized nav pills
- maintain strong accessibility and visible focus states
- header should feel like the top navigation of a public digital service, not a SaaS marketing website

## 7. Hero — Identity First

### Purpose

The hero must become the strongest visual moment on the page and establish official institutional identity before product details.

### Composition

Use an asymmetric full-width composition rather than a boxed 50/50 layout.

Recommended desktop ratio:

- 40–45% deep navy editorial content field
- 55–60% architectural photography

The photograph of Kantor Gubernur Sumatera Barat is the dominant image asset. It should be presented at high visual prominence with intentional crop and contrast, not reduced to a low-opacity background.

The geometry of the image boundary may subtly reference the gonjong roof silhouette or regional architectural angles, but it must remain restrained and structural rather than decorative.

### Content hierarchy

Institutional eyebrow:

`SISTEM PENGELOLAAN SOP AP`

Primary headline direction:

`Pengelolaan SOP AP, dari penyusunan hingga berlaku.`

The headline should be approximately 64–76px on large desktop viewports, scaling responsively.

Body copy should remain short: one concise paragraph describing the connected lifecycle across OPD, Biro Organisasi, evaluation, approval, and archive.

Primary action:

`Masuk ke Sistem`

Secondary text action:

`Lihat Arsip SOP →`

Do not place three or four hero CTAs.

### Product proof strip

A narrow workflow/product strip should overlap or sit directly below the boundary between the navy field and institutional image.

It shows the real lifecycle in compact form:

`Penyusunan → Pengajuan → Evaluasi → Perbaikan → Berita Acara → Pengesahan → Arsip`

This is not a floating dashboard card. It is a structural product proof element that connects the institutional hero to the software experience.

At most one stage is visually emphasized as an illustrative active state.

### Motion

Allowed:

- subtle initial reveal of copy and product strip
- optional very low-amplitude image parallax if performance and reduced-motion behavior are handled correctly

Not allowed:

- looping float
- glow animation
- decorative particles

## 8. Public Services — Asymmetric Utility Section

### Purpose

Immediately after the hero, expose the two public functions available without authentication:

- Arsip SOP
- Validasi PDF

### Layout

Do not use two identical feature cards.

Use an asymmetric two-part composition:

- one side is more editorial/list-oriented for Arsip SOP
- the other uses document/PDF geometry for Validasi PDF

The two panels may have contrasting surface treatment, for example:

- white / warm-neutral archive side
- pale blue or deep navy validation side

However, contrast must remain coherent with the page palette.

### Arsip SOP content

Explain that public users can search SOP documents that are already available in the archive, based on OPD and available document metadata.

CTA:

`Buka Arsip`

### Validasi PDF content

Explain that public users can inspect validation information embedded/generated by the system without entering the internal workspace.

CTA:

`Validasi PDF`

### Visual treatment

Use document rows, metadata lines, or stacked-sheet geometry as domain-relevant visual elements. Avoid generic illustration packs.

## 9. Workflow Storytelling

### Purpose

Demonstrate that the system supports a structured end-to-end workflow, but avoid making seven equal steps compete visually.

### Editorial grouping

Keep the full seven-stage lifecycle available in a small timeline or supporting element, but organize the main story into three larger chapters:

1. Penyusunan
2. Evaluasi & Perbaikan
3. Pengesahan & Arsip

### Layout

Use alternating editorial sections rather than a seven-column grid.

Recommended pattern:

- Chapter 01: text left, product preview right
- Chapter 02: product preview left, text right
- Chapter 03: text left, product preview right

Each chapter uses:

- oversized chapter number
- short headline
- concise explanation
- one meaningful product visualization

### Chapter 01 — Penyusunan

Visualize structured SOP creation:

- SOP identity
- pelaksana
- procedures
- regulations
- supporting document structure

The preview should look like a credible system surface, not a generic fake dashboard.

### Chapter 02 — Evaluasi & Perbaikan

Visualize:

- evaluator rubric / evaluation rows
- contextual note
- requested correction
- revision state
- relationship between evaluator feedback and OPD follow-up

This is where semantic warning/status colors may be used meaningfully.

### Chapter 03 — Pengesahan & Arsip

Visualize:

- completed evaluation context
- berita acara state
- internal approval state
- final archive availability
- lifecycle completion

Do not imply an external BSrE/Komdigi digital signature certification.

### Rhythm

Use more negative space than the current dashboard-like section. The section should feel editorial and explanatory, not dense.

## 10. Role-Based Workspace Showcase

### Purpose

Show that a single system gives each user a different operational context based on role and authority.

Primary heading direction:

`Satu sistem. Lima konteks kerja.`

### Role selector

Roles:

- Penyusun
- PJ Penyusun
- Evaluator
- PJ Evaluator Organisasi
- Kepala OPD

Use a horizontal desktop selector with typography, underline, or rail state. Avoid role-specific rainbow colors and large pill tabs.

Mobile may use a horizontally scrollable role selector while retaining proper tab semantics.

### Workspace canvas

Below the selector, show one large product canvas that changes according to the active role.

This replaces the current `responsibility/access/output` settings-panel feeling.

Examples:

#### Evaluator

Display:

- SOP title and metadata
- evaluation rubric rows
- evaluator note
- correction status
- lifecycle indicator

#### Kepala OPD

Display:

- SOP identity
- evaluation completion context
- berita acara state
- approval area
- approval history / archive transition

#### Penyusun

Display:

- current draft state
- procedural structure
- evaluator feedback if present
- revision history

The intent is for a visitor to understand the work visually, not merely read a feature list.

### Interaction

Switching roles should use a short 180–220ms cross-fade or similarly restrained transition.

Respect `prefers-reduced-motion`.

## 11. Signature Section — Document Traceability

### Purpose

Create the most memorable product-specific section after the hero.

This section communicates that SOPFlow preserves document lifecycle context and history rather than treating SOPs as disconnected files.

### Surface

Full-width deep navy section.

Primary statement:

`Satu dokumen. Satu riwayat yang dapat ditelusuri.`

### Visual

Create a large thin-line lifecycle visualization, for example:

`Draft → Revisi → Evaluasi → Berita Acara → Pengesahan → Arsip Berlaku`

Supporting metadata can include:

- version
- actor
- status
- event
- process history

All data shown in this visualization must clearly be illustrative. Avoid fake timestamps or numerical performance claims unless they are sourced from real product data and intentionally approved for the landing page.

### Style

- thin structural lines
- blue highlights
- white / slate typography
- restrained semantic status accent
- generous negative space
- no gradient glow

This section should become a visual signature unique to the SOP lifecycle domain.

## 12. Regional Identity

Regional identity is encouraged but must be subtle.

Allowed inspirations:

- Kantor Gubernur Sumatera Barat photography
- architectural silhouette
- gonjong-derived geometric cuts
- thin line geometry inspired by local architecture

Avoid:

- large decorative traditional patterns
- event-banner aesthetics
- ornamental borders
- excessive cultural motifs unrelated to the operational product

The result should feel local because of its architecture and composition, not because decorative cultural assets are pasted on top.

## 13. Closing Section

### Purpose

End with a memorable institutional statement instead of transitioning directly from a feature section to the footer.

Use a full-width or large-format institutional photograph, quieter than the hero but still visually strong.

Primary statement direction:

`Dokumen SOP tidak berhenti di folder.`

Supporting copy:

`Ia disusun, dievaluasi, diperbaiki, disahkan, dan dapat ditelusuri kembali.`

Primary CTA:

`Masuk ke Sistem`

Secondary text CTA:

`Jelajahi Arsip SOP →`

Do not overcrowd the closing section with multiple actions or feature bullets.

## 14. Footer

The footer should be compact, formal, and low-noise.

Include:

- Pemerintah Provinsi Sumatera Barat
- Sekretariat Daerah / Biro Organisasi identity as appropriate to current copy standards
- relevant public navigation
- system identity

Avoid large multi-column marketing footer patterns unless there is genuine content to justify them.

## 15. Typography

The internal dashboard remains compact. The public landing is allowed a separate display scale while still using the same core font family unless a deliberate type-system change is approved later.

Recommended landing scale:

- hero display: 64–76px large desktop
- major section display: 40–52px
- chapter numbers: 56–88px depending on composition
- body: 15–18px with comfortable line-height
- metadata / system labels: 10–12px

Large typography should be concentrated in the hero, major editorial sections, and closing statement. Do not make every heading oversized.

## 16. Product Preview Rules

All product previews must satisfy these rules:

- grounded in actual SOPFlow concepts
- clearly illustrative if not live data
- avoid impossible features
- avoid fake KPIs
- preserve real role terminology
- preserve real lifecycle terminology
- no BSrE / Komdigi certification claim
- no implication that internal approval equals an external certified signature service

Prefer composing previews from UI patterns already present in the application where possible so the landing and logged-in experience remain visually related.

## 17. Responsive Behavior

### Desktop

Use the full editorial composition described above.

### Tablet

- preserve strong photography
- reduce headline size
- allow hero image and navy content field to stack or overlap less aggressively
- keep public utility asymmetry where practical
- workflow chapters remain alternating only if readability remains strong

### Mobile

- stack hero content before the image or use a controlled integrated image composition
- preserve the institutional image; do not remove it entirely
- product lifecycle strip becomes horizontally scrollable or a compact vertical sequence if needed
- workflow storytelling becomes vertical
- role selector may scroll horizontally
- role workspace remains one focused panel
- traceability lifecycle can become vertical or horizontally scrollable if accessible

No horizontal page overflow.

## 18. Accessibility

Implementation must preserve or improve accessibility.

Requirements:

- semantic heading hierarchy
- visible keyboard focus
- sufficient text/background contrast
- meaningful alt text for institutional photography
- decorative geometry marked appropriately
- keyboard-operable role tabs
- appropriate ARIA tab/tabpanel semantics where applicable
- reduced-motion support
- no content dependent solely on color
- CTA labels remain explicit

## 19. Performance

The visual upgrade must not materially degrade landing performance.

Guidelines:

- optimize and appropriately size photography
- avoid video hero backgrounds
- avoid heavy animation libraries unless clearly necessary
- prefer CSS transitions and lightweight intersection behavior
- lazy-load below-the-fold media where appropriate
- avoid unnecessarily mounting multiple complete workspace previews simultaneously

## 20. Component Direction

The page should stay decomposed into focused components rather than returning to one large `LandingPage.tsx`.

Likely boundaries:

- `PublicHeader`
- `IdentityHero`
- `PublicServiceGateway`
- `WorkflowStory`
- `RoleWorkspaceShowcase`
- `DocumentTraceability`
- `InstitutionalClosing`
- `PublicFooter`

Supporting preview components may exist if they remain small and domain-specific.

`LandingPage.tsx` should mostly own data/configuration and section composition.

## 21. Scope Boundaries

This redesign must not change:

- authentication behavior
- backend APIs
- role permissions
- public archive route
- PDF validation route
- login route
- SOP workflow business rules
- internal approval semantics

The work is primarily a public landing presentation redesign.

Login redesign is outside this specific iteration unless implementation exposes a small shared visual primitive that can be reused without changing the approved login composition.

## 22. Acceptance Criteria

The redesign is successful when:

1. The hero is immediately more visually distinctive than the current version.
2. Kantor Gubernur photography is a dominant identity element, not a muted background.
3. The page contains clear large-scale dark/light rhythm rather than repeated bordered white cards.
4. Public services are asymmetric and visually differentiated.
5. Workflow is explained through three editorial chapters while retaining the full seven-stage lifecycle context.
6. Role switching shows realistic workspace compositions rather than simple feature lists.
7. A full-dark traceability section acts as a signature SOPFlow visual moment.
8. The closing section provides a strong final statement and CTA.
9. The page remains credible for a government environment.
10. No prohibited AI-slop patterns are introduced.
11. No false certification or fake metric claims appear.
12. Existing routes and application behavior remain unchanged.
13. Mobile and keyboard interaction remain usable and accessible.
14. The redesign continues to feel related to the internal design system without being constrained by the dashboard's compact visual density.

## 23. Implementation Philosophy

The redesign should improve visual impact through composition first.

Priority order:

1. information hierarchy
2. photography and editorial composition
3. product storytelling
4. color-field rhythm
5. typography scale
6. restrained interaction
7. decorative detail only when it reinforces the domain

When choosing between a visually impressive decorative effect and a simpler domain-relevant product visualization, choose the product visualization.
