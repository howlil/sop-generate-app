# Codebase Concerns & Technical Debt: Client

## 1. Security
- **Sensitive Data in LocalStorage:** TTE (Electronic Signature) profiles, signatures, and audit logs are stored in `localStorage` (`src/lib/data/tte-storage.ts`). This is insecure as `localStorage` is accessible via XSS.
- **Client-Side PIN Verification:** PIN verification logic is handled on the client side (`src/components/tte/PinVerificationDialog.tsx`), with a "master PIN" ('12345') hardcoded in demo mode (`src/lib/domain/tte.ts`).
- **Authorization Bypass:** Role-based access is enforced via `role-route-guard.ts` on the client side only, which can be easily bypassed if not backed by server-side session validation.

## 2. Maintenance & Complexity
- **Monolithic Components:** Several files exceed 700-800 lines, particularly in the diagramming engine (`SOPDiagramBpmn.tsx`, `SOPDiagramFlowchart.tsx`, `bpmnRouter.ts`, `orthogonalRouter.ts`). These contain dense geometric logic that is difficult to test and maintain.
- **Mock Data Coupling:** Large static JSON datasets in `src/lib/data` are bundled with the application. Transitioning to a real API will require significant refactoring of hooks that currently rely on these synchronous or `localStorage`-based mocks.
- **Large Generated Files:** `routeTree.gen.ts` is nearly 800 lines, adding noise to the source tree.

## 3. Accessibility (a11y)
- **Inaccessible Diagrams:** Workflow diagrams use `aria-hidden` on SVGs (`SOPDiagramFlowchart.tsx`), making the critical SOP structure and status information invisible to screen reader users.
- **Icon-Centric Navigation:** The narrow sidebar in `RoleLayout.tsx` relies primarily on icons. Without clear persistent text labels, this may pose challenges for users with cognitive impairments.

## 4. Performance
- **Bundle Size:** Static assets in `src/lib/data` and the heavy diagramming logic contribute to a larger initial bundle.
- **Persistence Overhead:** Frequent writes of large state objects (e.g., audit logs, peraturan list) to `localStorage` via Zustand persistence can lead to main-thread performance degradation.

## 5. Architectural Patterns
- **Business Logic Leakage:** Significant workflow and evaluation logic is implemented in client-side hooks and stores rather than being centralized in a backend, which will cause consistency issues in a multi-user production environment.
