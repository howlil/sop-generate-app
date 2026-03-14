# Codebase Conventions: Client

## 1. Naming Conventions
- **UI Components:** kebab-case (e.g., `src/components/ui/button.tsx`, `data-table.tsx`).
- **Feature Components:** PascalCase (e.g., `src/components/sop/BuatSOPDialog.tsx`, `SOPPreviewTemplate.tsx`).
- **Hooks:** camelCase with `use` prefix (e.g., `src/hooks/useAppRole.ts`).
- **Utilities/Types/Lib:** kebab-case (e.g., `src/utils/format-date.ts`, `src/lib/types/actor.ts`).
- **Routes:** TanStack Router flat routing convention (e.g., `src/routes/biro-organisasi.index.tsx`).

## 2. Architecture & Libraries
- **Framework:** React 19 with Vite 7 and TanStack Start.
- **State Management:** Zustand with persistence.
- **Styling:** Tailwind CSS v4.
- **UI Primitives:** Radix UI / shadcn/ui patterns.
- **Icons:** Lucide React.
- **Routing:** TanStack Router (File-based routing).

## 3. Quality Standards
- **TypeScript:** Strict configuration (`strict: true`, `noUnusedLocals`, `noUnusedParameters`).
- **Linting/Formatting:** ESLint and Prettier (likely managed at the root or inherited).
- **Project Structure:** Feature-based Layered Architecture. Separation between Presentation (Routes, Pages, Components), Logic (Hooks, Stores), and Domain (Business rules, API config).
