# Testing Practices: Client

## 1. Testing Framework
- **Runner:** Vitest (configured in `package.json` and `vite.config.ts`).
- **Libraries:** `@testing-library/react` and `jsdom` for component testing.

## 2. Current State
- **Infrastructure:** Present and configured.
- **Tests:** No test files (`*.test.ts`, `*.spec.ts`) were found within the `./client` directory despite the infrastructure being present.
- **Commands:** `pnpm test` is configured to run `vitest run`.

## 3. Strategy
- Future tests should focus on:
  - Domain logic in `src/hooks`.
  - Complex state transitions in Zustand stores.
  - Critical UI components and layout guards.
