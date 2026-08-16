# Full-Viewport Login Design

## Intent

Change the approved SOPFlow login design from a centered authentication card into a true full-viewport split page. The existing blue SOP visual language and right-side form content stay, but the page must no longer read as a floating card inside a gray canvas.

## Scope

Frontend/UI only.

In scope:
- `client/src/pages/login/LoginPage.tsx`
- `client/src/pages/login/components/LoginHero.tsx`
- `client/src/pages/login/components/LoginForm.tsx` only if spacing must be adjusted for the new shell
- `client/src/pages/__tests__/public-auth-design-contract.test.ts`

Out of scope:
- backend
- auth API or DTOs
- auth store
- route semantics and redirects
- permissions
- workflow behavior
- archive/PDF behavior
- new authentication methods

## Approved direction

Use approach A: true full viewport split.

Desktop behavior:
- The login surface occupies the full viewport width and height: effectively `100vw × 100vh`.
- No outer `max-width` container.
- No page-level inset margin around the login surface.
- No rounded outer card, outer border, or outer card shadow.
- Left visual panel occupies approximately 45% of the viewport width.
- Right form panel occupies approximately 55% of the viewport width.
- Both panels fill the viewport height.

The existing centered-card implementation elements that must be removed from the outer shell include `max-w-[1120px]`, `rounded-[22px]`, page padding/inset used to expose the gray canvas, and `shadow-raised` on the main auth shell.

## Left visual panel

Keep the current approved visual identity:
- SOPFlow blue layered gradient using the existing primary-blue/navy family.
- `Portal Internal SOP` eyebrow.
- Headline: `Kelola SOP secara terstruktur dari penyusunan hingga arsip`.
- Institution line: `Biro Organisasi · Pemerintah Provinsi Sumatera Barat`.
- Workflow stages: `Penyusunan`, `Evaluasi`, `Pengesahan`, `Arsip`.
- Existing outline icons and asterisk/star-like accent.

Change only its relationship to the page shell:
- Remove the inset `m-1.5` / `sm:m-2` behavior on desktop so the visual panel reaches the viewport edges.
- Remove large card-like corner rounding on desktop; the panel should read as one side of the page, not a card nested inside another card.
- The panel must fill the full desktop height.
- Internal content remains padded so typography does not touch viewport edges.
- Content remains bottom-weighted, preserving the visual hierarchy of the approved reference.

On mobile/tablet where panels stack, modest local rounding is unnecessary because the page itself should remain edge-to-edge. The gradient panel can use straight viewport edges.

## Right form panel

The right side remains white and fills the remaining viewport area.

Keep:
- `Kembali ke beranda` action.
- Blue asterisk accent.
- Heading `Masuk ke sistem`.
- Existing explanatory copy.
- Existing email/password fields.
- Existing password visibility behavior.
- Existing full-width primary `Masuk` CTA.
- Existing support line.

Do not make the actual form controls span the whole 55% panel. Preserve the form content width around `max-w-[430px]` so fields remain comfortable to read and operate.

Desktop positioning:
- Vertically center the form cluster within the right viewport panel.
- Horizontally center it within the right panel, with safe responsive horizontal padding.
- The back action belongs to the same form column and should not create a separate page header.

## Responsive behavior

Desktop (`lg` and above):
- Two-column 45/55 split.
- `min-h-screen` / viewport-height fill.
- No horizontal overflow.
- Left and right both stretch to the viewport height.

Below desktop:
- Stack left panel above form panel.
- Page may scroll naturally because combined content can exceed viewport height.
- Left panel uses a practical minimum height rather than forcing 100vh.
- Right panel keeps safe vertical/horizontal padding.
- No centered outer card or exposed surrounding gray canvas.

## Visual constraints

- Preserve Inter and existing design-system typography.
- Preserve existing primary blue token and neutral colors.
- The left-panel gradient remains the only login-specific gradient exception.
- No purple-heavy palette, glassmorphism, neon glow, floating decorative blobs, or new external assets.
- Do not add large card shadows.
- Avoid introducing additional decorative components; this change is primarily shell/layout correction.

## Behavior and accessibility constraints

Preserve exactly:
- `await onSubmitLogin({ email, kataSandi: password })`
- email validation behavior and strings
- password minimum-length validation
- loading/disabled state
- password show/hide labels and keyboard accessibility
- route behavior and post-login redirect behavior
- focus-visible treatment

No social login, registration prompt, or new auth provider.

## Test contract

Update the public auth design contract so it proves the new shell rather than the centered-card layout.

The contract should assert:
- outer login page uses `min-h-screen` and a desktop two-column split
- split is approximately 45/55
- no `max-w-[1120px]` outer auth container
- no `rounded-[22px]` outer shell
- no `shadow-raised` outer shell
- no large desktop page inset around the auth surface
- `LoginHero` no longer has desktop inset margin/card behavior
- the existing SOP-specific hero copy and workflow remain
- the existing login submission payload and validation remain unchanged

## Success criteria

At common desktop resolutions such as 1366×768, 1440×900, and 1920×1080, the login page must visually fill the entire browser viewport. It should read as a split-screen login page, not as a floating white card centered inside a gray background.

The left visual panel should touch the top, left, and bottom viewport edges. The right white panel should touch the top, right, and bottom viewport edges. Only the form content itself remains constrained to a readable width.
