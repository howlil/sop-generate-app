# Client Directory Hierarchy - Sistem SOP 2026

## 1. Directory Structure

```text
client/
├── public/                 # Static assets (images, favicon, etc.)
├── src/
│   ├── components/         # Feature-based component organization
│   │   ├── berita-acara/   # Components for official report generation
│   │   ├── evaluasi/       # Components for SOP evaluation (scoring, rating)
│   │   ├── layout/         # Layout-specific components (Header, Sidebar, Toast)
│   │   ├── sop/            # SOP management components (list, preview, versioning)
│   │   ├── tte/            # Tanda Tangan Elektronik / Signature components
│   │   └── ui/             # Generic, low-level UI primitives (Radix-based)
│   ├── hooks/              # Custom React hooks (logic, data fetching, state bridges)
│   ├── lib/
│   │   ├── api/            # API configuration and mocking toggle
│   │   ├── auth/           # Authentication logic
│   │   ├── constants/      # Global constants and enum definitions
│   │   ├── data/           # Mock data and static JSON datasets
│   │   ├── domain/         # Business logic and domain models
│   │   ├── stores/         # Zustand global state stores
│   │   └── types/          # TypeScript interface and type definitions
│   ├── pages/              # Role-based page compositions
│   │   ├── kepala-biro-organisasi/
│   │   ├── kepala-opd/
│   │   ├── tim-evaluasi/
│   │   ├── tim-penyusun/
│   │   ├── ttd-elektronik/
│   │   └── validasi/
│   ├── routes/             # TanStack Router file-based route definitions
│   │   ├── __root.tsx      # Root document shell
│   │   ├── biro-organisasi.tsx # Layout for Biro Organisasi role
│   │   ├── kepala-opd.tsx  # Layout for Kepala OPD role
│   │   └── ...             # Feature/role-specific route files
│   ├── utils/              # Utility functions (formatting, ID generation, etc.)
│   ├── router.tsx          # TanStack Router instance configuration
│   ├── routeTree.gen.ts    # Auto-generated route tree for type-safety
│   ├── styles.css          # Global Tailwind and base styles
│   └── vite-env.d.ts       # Vite environment type definitions
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## 2. File Organization Principles

- **Component Colocation**: Feature-specific components are kept in `src/components/[feature]`.
- **Role-Based Separation**: Pages and routes are explicitly categorized by user role (`biro-organisasi`, `kepala-opd`, `tim-penyusun`, etc.) to enforce logical boundaries and role-based access control.
- **Hook-Driven Logic**: Complex logic is extracted into custom hooks in `src/hooks` to keep components clean and focused on rendering.
- **Domain-Centric Logic**: Business rules (e.g., status transitions, scoring) are placed in `src/lib/domain` to ensure they can be used and tested independently of UI.
- **State Management Separation**: State is divided into specialized stores in `src/lib/stores` to prevent a single monolithic global state object.
- **Type-Safe Routing**: Routes are defined in a file-based structure within `src/routes`, and the `routeTree.gen.ts` ensures type-safety throughout the application.
