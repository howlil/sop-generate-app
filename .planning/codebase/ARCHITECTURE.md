# Client-Side Architecture - Sistem SOP 2026

## 1. Architectural Overview
The client application is built with **React 19** and **TanStack Start**, following a **Feature-based Layered Architecture**. The codebase is designed for modularity, role-based access control (RBAC), and separation of concerns between business logic, UI, and data management.

## 2. Core Technologies
- **Framework**: React 19 (TypeScript)
- **Routing**: TanStack Router (File-based, Type-safe)
- **State Management**: Zustand (Global/Domain State)
- **UI Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (Primitives), Lucide React (Icons)
- **Build Tool**: Vite

## 3. Logical Layers
The application is organized into the following logical layers:

### A. Presentation Layer
- **Routes (`src/routes/`)**: Handles URL mapping, route parameters, and role-based layout nesting.
- **Pages (`src/pages/`)**: High-level page components that compose features, hooks, and layouts.
- **Components (`src/components/`)**:
    - `ui/`: Generic UI primitives (Button, Dialog, Label, etc.).
    - `layout/`: Global and role-specific layout elements (Header, Sidebar, Toast).
    - `[feature]/`: Domain-specific components (e.g., `sop/`, `evaluasi/`, `tte/`).

### B. Logic & State Layer
- **Hooks (`src/hooks/`)**: Custom React hooks that bridge the presentation layer with domain logic and state. They handle data fetching, filtering, and local component logic.
- **Stores (`src/lib/stores/`)**: Zustand stores for managing persistent and global domain state (e.g., `app-store`, `evaluasi-store`, `sop-status-store`).

### C. Domain & Service Layer
- **Domain (`src/lib/domain/`)**: Pure business logic, state machines (for SOP status), and domain models.
- **API (`src/lib/api/`)**: API configuration and client logic. Supports switching between mock data and real API via environment variables.
- **Auth (`src/lib/auth/`)**: Authentication-related logic.

## 4. Design Patterns
- **Role-Based Layouts**: Uses TanStack Router's nested routing to apply role-specific layouts (e.g., `biro-organisasi.tsx` serves as a layout for all routes under `/biro-organisasi`).
- **State Machine Pattern**: Used in `lib/domain/sop-status.ts` to manage the complex lifecycle of SOP documents.
- **Repository Pattern (Simplified)**: Feature-specific hooks in `src/hooks/` act as a data access layer, abstracting the source of data (mock vs API).
- **Composition Pattern**: Pages are composed of feature-specific components and shared UI primitives.

## 5. State Management Strategy
- **Global State**: Managed by specialized Zustand stores for different domains.
- **URL State**: Managed by TanStack Router (search params, path params) for filters and pagination.
- **Local State**: Standard React `useState` and `useReducer` for transient UI states.
- **Server State**: Abstracted through custom hooks, with a configurable mock/API toggle.

## 6. Routing Structure
TanStack Router's file-based system reflects the application's role-based organization:
- `/` - Landing / Login
- `/biro-organisasi/*` - Biro Organisasi (Admin/Evaluator) dashboard and management.
- `/kepala-opd/*` - Kepala OPD (Approver) workflow.
- `/tim-penyusun/*` - Tim Penyusun (Creator) workflow.
- `/tim-evaluasi/*` - Tim Evaluasi workflow.
- `/validasi/*` - Public validation and signature verification.
