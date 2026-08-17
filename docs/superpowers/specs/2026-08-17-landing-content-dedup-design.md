# Landing Page Content Deduplication Design

## Goal

Reduce repeated navigation, lifecycle messaging, mock data, and generic marketing copy on the public landing page without changing the established visual language or unrelated UI.

## Scope

Only landing-page composition and copy are in scope. Preserve existing colors, spacing system, typography treatment, card shapes, shadows, responsive behavior, and all authenticated application screens.

## Changes

1. Public header keeps only public destinations and login: Arsip SOP, Validasi PDF, Masuk. Remove in-page Alur kerja and Peran links from the global header.
2. Hero keeps the current centered visual composition and product preview, but shortens the supporting copy and removes duplicated trust-cue messaging and repeated institutional line below the CTAs.
3. Keep PublicServiceGateway as the single dedicated public-service section for Arsip SOP and Validasi PDF.
4. Remove DocumentTraceability from the landing composition because it repeats the same archive/validation value proposition.
5. WorkflowStory keeps the seven-step process visualization. Remove the three repeated editorial workflow chapters and their secondary previews.
6. RoleWorkspaceShowcase keeps the five-role selector and current visual container, but removes the repeated per-role mock workspace previews. The selected role shows concise responsibility and output information only.
7. InstitutionalClosing remains visually unchanged but uses direct institutional copy and a single login CTA; remove the repeated archive CTA and lifecycle slogan.
8. PublicFooter keeps institutional identity and copyright only; remove the repeated Arsip SOP, Validasi PDF, and Masuk navigation.
9. LandingProductPreview must not present static mock metrics as operational statistics. Remove the metrics row containing 52 OPD, 4 SOP, and PDF.

## Copy Principles

- Prefer factual, administrative language over generic SaaS slogans.
- Avoid repeated lifecycle enumerations when the workflow section already communicates the process.
- Avoid phrases such as “Satu sistem. Lima konteks kerja.” and “Dokumen SOP tidak berhenti di folder.”
- Do not introduce new claims or runtime-looking statistics.

## Non-Goals

- No redesign of colors, spacing, typography, surfaces, or responsive breakpoints.
- No changes to login, archive, validation, or authenticated workspace behavior.
- No new dependencies or new data fetching.
- No broad refactor of shared UI components.

## Verification

Add/adjust landing regression tests to confirm the removed duplicate navigation/copy does not return and that the hero remains centered with the existing product-preview treatment.