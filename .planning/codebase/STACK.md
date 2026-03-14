# Technology Stack Findings - `./client`

Analysis of the technology stack for the client-side application.

## Core Languages & Frameworks
- **Programming Language:** [TypeScript](https://www.typescriptlang.org/) (TSX)
- **Frontend Library:** [React 19](https://react.dev/)
- **Meta-framework & Routing:** [TanStack Start](https://tanstack.com/start) / [TanStack React Router](https://tanstack.com/router)
  - Provides type-safe routing, SSR, and full-stack capabilities.
- **Build Tool:** [Vite 7](https://vitejs.dev/)
  - Uses `@vitejs/plugin-react` and `@tailwindcss/vite` (Tailwind v4 Vite plugin).
  - Uses `tanstackStart()` and `@tanstack/router-plugin` for TanStack integration.

## Styling & UI Components
- **CSS Framework:** [Tailwind CSS v4](https://tailwindcss.com/)
  - Uses the new `@tailwindcss/vite` plugin.
  - Utilities: `tailwind-merge`, `clsx`, `class-variance-authority`.
- **UI Primitives (Unstyled):** [Radix UI](https://www.radix-ui.com/)
  - Used for accessible components (Accordion, Alert Dialog, Dialog, Dropdown Menu, Label, Slot).
- **Icons:** [Lucide React](https://lucide.dev/)

## State Management
- **Global State:** [Zustand](https://zustand-demo.pmnd.rs/)
  - Implements persistent storage using `persist` middleware (e.g., `app-store.ts`).
  - Stores identified for: App role, Audit log, Evaluasi, Pelaksana, Peraturan, SOP meta/status, Tim penyusun, and Verifikasi batch.

## Data Fetching & Caching
- **Framework integration:** [TanStack React Query](https://tanstack.com/query)
  - (Implied by `@tanstack/react-router-ssr-query` and `@tanstack/react-start` dependency).
  - Used for SSR-compatible data fetching and management.

## Package Manager
- **Package Manager:** [pnpm](https://pnpm.io/) (determined by `pnpm-lock.yaml`).

## Quality Assurance & Testing
- **Test Runner:** [Vitest](https://vitest.dev/)
- **Testing Library:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Browser Environment:** `jsdom`
- **Linting:** Integrated via TypeScript rules in `tsconfig.json`.
