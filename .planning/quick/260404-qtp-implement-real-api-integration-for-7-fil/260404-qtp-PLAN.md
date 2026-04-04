---
title: "Quick Task 260404-qtp: Implement Real API Integration"
date: 2026-04-04
mode: quick-full
tasks:
  - id: 1
    title: "Create API hooks for Tim Penyusun & OPD Management"
    files:
      - "client/src/features/organisasi/index.ts"
      - "client/src/features/organisasi/hooks.ts"
      - "client/src/pages/kepala-biro-organisasi/ManajemenTimPenyusun.tsx"
      - "client/src/pages/kepala-biro-organisasi/ManajemenOPD.tsx"
    action: |
      1. Create `useTimPenyusun(opdId?)` hook in `@/features/organisasi/hooks.ts` with:
         - `useQuery` for fetching tim penyusun list
         - `useMutation` for create, update, delete, nonaktif, pindah operations
         - Auto-invalidation of queries on mutation success
      2. Create `useOpdMutations()` hook in `@/features/organisasi/hooks.ts` with:
         - `useMutation` for OPD create/update/delete
         - Auto-invalidation of OPD list on mutation success
      3. Update ManajemenTimPenyusun.tsx:
         - Replace stub functions with hook mutations
         - Replace empty `timList` with data from `useTimPenyusun()`
         - Wire up all CRUD operations (create, edit, delete, nonaktif, pindah)
      4. Update ManajemenOPD.tsx:
         - Replace TODO comments with `useOpdMutations()` calls
         - Wire up create/edit/delete dialog handlers to mutations
    verify: |
      - All stub functions removed from ManajemenTimPenyusun.tsx
      - All TODO comments removed from ManajemenOPD.tsx
      - New hooks export proper React Query hooks with useQuery/useMutation
      - Create/Edit/Delete operations trigger proper mutations and show toast feedback
      - TypeScript compiles without errors
    done: false

  - id: 2
    title: "Create API hooks for Evaluation workflow (DetailEvaluasiOPD & EvaluasiSOP)"
    files:
      - "client/src/features/evaluasi/hooks.ts"
      - "client/src/pages/tim-evaluasi/DetailEvaluasiOPD.tsx"
      - "client/src/pages/tim-evaluasi/EvaluasiSOP.tsx"
    action: |
      1. Create/extend evaluation hooks in `@/features/evaluasi/hooks.ts`:
         - `useEvaluasiOpd(opdId)` — fetch SOP list for specific OPD
         - `useRiwayatEvaluasiOpd(opdId)` — fetch OPD evaluation history
         - `useRiwayatEvaluasiSop(sopId)` — fetch SOP evaluation history
         - `useEvaluasiSubmit()` — mutation for submitting evaluation results
         - Refactor `useEvaluasiDraft(sopId)` from localStorage to server-side auto-save:
           * `useQuery` to fetch draft from API
           * `useMutation` with debounced auto-save on changes
      2. Update DetailEvaluasiOPD.tsx:
         - Remove all 6 stub functions
         - Replace `getInitialSopDaftarList()` with `useEvaluasiOpd(opdId)`
         - Replace `getRiwayatEvaluasiOpd/Sop` with history hooks
         - Replace localStorage draft logic with server-side `useEvaluasiDraft`
         - Wire submit dialog to `useEvaluasiSubmit()` mutation
      3. Update EvaluasiSOP.tsx:
         - Replace local `setSopStatusOverride` with `useEvaluasiSubmit()` mutation
         - Replace localStorage draft with server-side auto-save hook
         - Wire "Simpan Draft" button to mutation (can be auto-save, button becomes manual trigger)
    verify: |
      - All 6 stub functions removed from DetailEvaluasiOPD.tsx
      - useEvaluasiDraft no longer uses localStorage (check for localStorage.removeItem/setItem)
      - Evaluation submit calls API mutation, not local state override
      - Draft auto-save triggers on form changes with debounce
      - TypeScript compiles without errors
    done: false

  - id: 3
    title: "Wire up remaining API stubs (ManajemenPeraturan & DetailSOP)"
    files:
      - "client/src/features/organisasi/hooks.ts"
      - "client/src/features/sop/hooks.ts"
      - "client/src/pages/kepala-opd/ManajemenPeraturan.tsx"
      - "client/src/pages/kepala-opd/DetailSOP.tsx"
    action: |
      1. Create `usePeraturanRiwayat(peraturanId)` hook in `@/features/organisasi/hooks.ts`:
         - `useQuery` to fetch version history for a peraturan
      2. Create `useSopVersionSnapshot(sopId, version)` hook in `@/features/sop/hooks.ts`:
         - `useQuery` to fetch snapshot data for a specific SOP version
      3. Update ManajemenPeraturan.tsx:
         - Replace `getRiwayatVersi()` mock implementation with `usePeraturanRiwayat()` hook
         - Hook should be called when riwayat dialog opens
      4. Update DetailSOP.tsx:
         - Replace `snapshot: undefined` with data from `useSopVersionSnapshot()`
         - Hook should be called for each version in the history list
    verify: |
      - getRiwayatVersi() no longer returns hardcoded mock data
      - Version snapshots in DetailSOP.tsx are populated from API
      - New hooks follow existing React Query patterns
      - TypeScript compiles without errors
    done: false

must_haves:
  - "All existing API hooks (useOpd, useSop, usePeraturan, useEvaluasi) are already implemented in @/features/"
  - "apiClient is an axios instance exported from @/utils/api-client"
  - "React Query is already configured: @tanstack/react-query is in package.json"
  - "useToast utility exists at @/utils/ui for showing success/error messages"
  - "useEvaluasiDraft hook currently uses localStorage — must be refactored to API"
  - "CONTEXT.md decisions are locked: dedicated hooks pattern, server-side draft auto-save"

key_links:
  - "Existing organisasi hooks: client/src/features/organisasi/"
  - "Existing evaluasi hooks: client/src/features/evaluasi/"
  - "Existing sop hooks: client/src/features/sop/"
  - "API client: client/src/utils/api-client.ts"
