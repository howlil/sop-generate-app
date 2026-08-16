# Reference-Inspired Login Card Design

## Intent

Redesign only the SOPFlow login surface so it follows the composition and visual confidence of the approved reference image while remaining consistent with the existing SOPFlow design tokens and government domain context.

This design supersedes the earlier login-specific prohibition on gradients only for the left visual panel. The user explicitly approved a restrained blue visual panel similar to the reference. The exception does not apply to dashboard pages or other public surfaces.

## Scope

Frontend/UI only.

In scope:
- `client/src/pages/login/LoginPage.tsx`
- `client/src/pages/login/components/LoginHero.tsx`
- `client/src/pages/login/components/LoginForm.tsx`
- `client/src/pages/__tests__/public-auth-design-contract.test.ts`

Out of scope:
- backend, API, DTO, Prisma, permissions, auth store, routing semantics, workflow transitions, archive behavior, PDF validation, and authentication payloads.

## Overall composition

Use one centered authentication container on a very light neutral page background. Desktop is a two-column surface with an approximately 45/55 visual-to-form split. The left side is a rounded visual panel. The right side is a focused white login panel. Mobile stacks the visual and form areas vertically while preserving readable order and form accessibility.

The shell should feel closer to the approved reference than the current institutional service-card layout: one cohesive auth object, tighter visual relationship between both panels, and fewer disconnected outer header elements.

## Left visual panel

The left panel is the primary visual feature.

- Use SOPFlow primary blue `#1D4ED8` and deeper navy/indigo tones only.
- Use a restrained layered blue gradient and soft radial highlights. No purple-heavy palette, neon effects, glassmorphism, or decorative floating blobs.
- Use a large rounded surface around 16-20px, intentionally larger than dashboard controls because this is a standalone visual panel.
- Add a simple asterisk/starburst-like line mark near the top as a decorative brand accent. It must be implemented with CSS/HTML or an existing icon; do not add a new external asset.
- Keep content domain-specific:
  - eyebrow: `Portal Internal SOP`
  - headline: `Kelola SOP secara terstruktur dari penyusunan hingga arsip`
  - institution line: `Biro Organisasi · Pemerintah Provinsi Sumatera Barat`
- Add a compact workflow rail at the bottom with exactly four stages: `Penyusunan`, `Evaluasi`, `Pengesahan`, `Arsip`.
- Workflow icons are simple outline icons and remain secondary to the headline.
- Do not use the Kantor Gubernur photo on this login iteration; the approved direction is abstract and visual-first like the reference.

## Right login panel

Use a clean modern SaaS-style form surface without social login.

- Keep a small `Kembali ke beranda` action at the top.
- Use a small blue accent mark above or adjacent to the title.
- Heading: `Masuk ke sistem`.
- Supporting copy: `Gunakan akun yang telah didaftarkan administrator.`
- Email label and placeholder remain `Email` and `nama@instansi.go.id`.
- Password label remains `Kata sandi`, including existing show/hide affordance.
- Primary CTA is a full-width blue `Masuk` button.
- Do not render social login buttons, social-login separators, or sign-up prompts.
- Keep the support row concise: `Butuh bantuan? Hubungi administrator instansi.`

## Design system alignment

- Font remains Inter and existing application typography.
- Primary action uses existing primary blue semantic tokens.
- Neutral text, borders, and page background use existing theme values.
- Inputs keep existing control radius and focus behavior.
- Large auth shell and visual panel may use a larger radius than dashboard cards because the user explicitly approved the reference composition.
- Shadow remains soft and secondary to borders/tonal separation.

## Behavior and accessibility constraints

Preserve exactly:
- `await onSubmitLogin({ email, kataSandi: password })`
- existing email validation strings and password minimum-length validation
- loading/disabled behavior
- password visibility toggle and accessible labels
- login route behavior and post-login redirects
- keyboard focus visibility

Do not introduce any new authentication method.

## Responsive behavior

- Desktop: cohesive centered card with two columns.
- Tablet: retain two columns only when the form remains comfortable; otherwise stack.
- Mobile: stack the visual panel above the form, reduce headline size, keep fields and CTA full width, and avoid horizontal overflow.

## Success criteria

The result should visibly resemble the approved reference in layout and polish while still reading as SOPFlow: blue government-product palette, SOP-specific copy, one integrated auth card, abstract left visual panel, and a clean right-side login form. Auth behavior must remain unchanged.