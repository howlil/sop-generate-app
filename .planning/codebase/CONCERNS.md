# CONCERNS.md — Technical Debt and Issues

## 1. Tech Debt

### Critical
- **No real API integration** — Client is entirely mock-data driven. A `USE_MOCK` flag is referenced conceptually but never implemented as an actual toggle. All data comes from `src/lib/seed/*.json` and `src/lib/data/*.ts` static files. The server is a disconnected generic scaffold with no SOP/OPD/Evaluasi domain endpoints.
- **Duplicate BeritaAcaraPage** — Two near-identical files exist:
  - `client/src/pages/kepala-opd/BeritaAcaraPage.tsx` (467 lines)
  - `client/src/pages/tim-penyusun/BeritaAcaraPage.tsx` (469 lines)
  Copy-paste duplication with minimal differences.

### Moderate
- **Verifikasi batch state reset on every hook mount** — `useVerifikasiBatchDetailPage.ts` reinitializes state on each mount; no persistence across navigations.
- **Inconsistent `author` vs `authorNamaLengkap` fields** on SOP type — Two different field names used for the same concept across different parts of the codebase.
- **`StatusHasilEvaluasi` gap** — Declares `'Perlu Perbaikan'` status that has no corresponding domain mapping or UI handling.
- **Evaluation case store not persisted** — `evaluasi-cases` Zustand store lacks `persist` middleware, while all other stores are persisted.

---

## 2. Security

### Critical
- **Hardcoded master PIN `'12345'`** — TTE (electronic signature) authentication has a hardcoded bypass PIN that grants access regardless of actual credentials. Located in `src/lib/domain/tte.ts` or TTE-related logic.
- **TTE data in plain localStorage** — Signature data stored using a weak djb2 hash with no encryption. Any client-side script can read/tamper with TTE data (`src/lib/data/tte-storage.ts`).
- **Client-side-only role switching** — Role/permission system is entirely frontend with zero server verification. Roles are stored in client state and can be manipulated.
- **Zero auth guards on server** — No `@UseGuards()` decorators on any server endpoints. All API routes are publicly accessible. JWT auth code exists (bcrypt dependency present) but is dead code.

### Moderate
- **CORS fallback uses placeholder domain** — Server CORS config likely includes a placeholder or wildcard origin that would be insecure in production.

---

## 3. Performance

- **Diagram routing O(n²) path-finding** — Two large routing files (`~789` and `~780` lines) run synchronous path-finding algorithms. Could be slow with large SOP flowcharts.
- **Dummy SOP generation at module load** — Static seed data generation runs at import time rather than lazily, adding to initial bundle parse time.
- **Chart data computation in 517-line page component** — `GrafikEvaluasiTahunan.tsx` computes chart data inside the render component without memoization.

---

## 4. Fragile Areas

- **800-line diagram components** — FlowChart/diagram components combine layout math, SVG rendering, and useEffect hooks in single massive components. High coupling, hard to maintain.
- **Mutable ref bookkeeping in FlowchartArrowConnector** — Uses mutable refs to track connector positions, making the rendering logic fragile and hard to debug.
- **Verifikasi batch store has no persistence** — State is lost on page refresh; no `persist` middleware.
- **TTE signature ID collision risk** — IDs generated via `Date.now() + Math.random()` — not cryptographically unique, could collide in rapid succession.

---

## 5. Missing Critical Features

- **No authentication system** — No login flow, no session management, no token validation. The entire app runs without auth.
- **No domain API on server** — Server only has a Users module. All SOP, OPD, Evaluasi, TTE, Peraturan, and Verifikasi endpoints are missing.
- **No enforced SOP status transitions** — Status can be set to any value without validation of the correct workflow sequence. Business rules are UI-only hints, not enforced constraints.

---

## 6. Test Coverage Gaps

- **Client: zero tests** — No test files exist in `client/src/`. Vitest is configured but unused.
- **Server: only Users module covered** — Only `src/modules/users/` has `*.spec.ts` files. All other modules (auth, common utilities) are untested.
- **No E2E tests** — `jest-e2e.json` config exists but no e2e test files are written.
- **No coverage thresholds** enforced in either Jest or Vitest configs.

---

## 7. Dependencies at Risk

- **Devtools bundled without lazy loading** — React Query Devtools and TanStack Router Devtools are imported unconditionally. Should be lazy-loaded or excluded from production builds.
- **bcrypt present but auth is dead code** — `bcrypt` is a server dependency but the JWT authentication implementation that uses it is incomplete/dead. Either complete auth or remove the dependency.

---

## 8. Architecture Concerns

- **Client-server disconnect** — The client is a fully functional mock prototype. The server is an empty scaffold. They share no contracts (no shared types, no OpenAPI spec). Integration will require significant rework.
- **No API client layer** — Client has no HTTP client setup (no axios instance, no react-query fetcher). When real API integration begins, there's no established pattern to follow.
- **Role-based routing is fragile** — Route guards are implemented via React component logic in layouts, not at the router level. Easy to bypass.

---

## 9. Code Quality

- **Large page components** — Several page files exceed 400–500 lines (e.g., `DetailEvaluasiOPD.tsx`, `GrafikEvaluasiTahunan.tsx`). Logic and UI are mixed without separation.
- **Domain terms in Indonesian** — Consistent but requires Indonesian language knowledge to navigate the codebase (e.g., `Pelaksana`, `Penyusun`, `Peraturan`, `Penugasan`).
- **Deleted planning docs** — Multiple `.planning/` and `docs/` files were deleted in the working tree, indicating planning artifacts are being removed without archiving.
