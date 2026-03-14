# External Integrations, APIs, and Libraries - `./client`

Analysis of the external connections and primary libraries for the client-side application.

## API & Data Layer Strategy
- **Base Connection:** Configured via `VITE_API_BASE_URL` in environment variables.
- **Mocking System:**
  - Uses `VITE_USE_MOCK` toggle (default: `true` in dev).
  - Seeded data resides in `src/lib/seed/*.json`.
  - Data access is abstracted in `src/lib/data/*` layer (e.g., `sop-detail.ts`, `evaluasi-data.ts`).
- **Communication:** Likely using standard `fetch` API as no `axios` or other HTTP clients were found in `package.json`.
- **Full-stack functions:** Using `@tanstack/react-start` which may facilitate server-side functions for API interactions.

## Key External Libraries
- **[`qrcode`](https://www.npmjs.com/package/qrcode):** Used for generating QR codes, likely for document validation or TTE (Electronic Signature) verification.
- **[`lucide-react`](https://lucide.dev/):** Provides the icon set for the application.
- **[`Radix UI`](https://www.radix-ui.com/):** Low-level primitives for high-quality accessible UI components (dialogs, menus, etc.).
- **[`Zustand`](https://zustand.docs.pmnd.rs/):** Simple and persistent global state management for application-wide context.
- **[`web-vitals`](https://www.npmjs.com/package/web-vitals):** Library for measuring user-centric metrics in the browser.

## Styling Management Libraries
- **[`class-variance-authority` (cva)](https://cva.style/docs):** For creating type-safe component variants (e.g., buttons with different sizes/colors).
- **[`clsx`](https://www.npmjs.com/package/clsx) & [`tailwind-merge`](https://www.npmjs.com/package/tailwind-merge):** Standard utility set for merging and conditionally applying Tailwind classes.

## Internal Design System
- Custom components built on top of Radix primitives, following the design system guidelines (documented in `docs/design-style-guide.md`).
- Centralized styles in `src/styles.css` using Tailwind v4 syntax.

## Development & Build Integrations
- **[TanStack Devtools](https://tanstack.com/devtools):** Integrated via `@tanstack/react-devtools`, `@tanstack/react-router-devtools`, and `@tanstack/devtools-vite` for easier debugging in development mode.
- **Vite TSConfig Paths:** Allows using `@/` path aliases configured in `tsconfig.json`.
