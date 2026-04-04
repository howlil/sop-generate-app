# Quick Task 260404-qtp: Implement real API integration for 7 files with stubs/TODOs - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Task Boundary

Replace all stub/mock API calls in 7 page-level components with real API integrations using dedicated React Query hooks. Files:
1. ManajemenTimPenyusun.tsx — Full stubs (CRUD + nonaktif + pindah)
2. DetailEvaluasiOPD.tsx — Full stubs (riwayat, draft, submit)
3. ManajemenOPD.tsx — Partial (create/update/delete mutations)
4. EvaluasiSOP.tsx — Local state (submit evaluation)
5. ManajemenPeraturan.tsx — Partial (riwayat endpoint)
6. DetailSOP.tsx — Partial (version snapshot)

</domain>

<decisions>
## Implementation Decisions

### Hook Pattern
- Use **dedicated React Query hooks** (e.g., `useTimPenyusun()`, `useEvaluasiOpd()`) matching existing patterns like `useOpd()`, `useSop()`, `usePeraturan()`
- Hooks should be created in the appropriate feature directories under `@/features/`
- Each hook should use `useQuery`/`useMutation` from `@tanstack/react-query`

### Draft State Management
- **Server-side auto-save** for evaluation drafts
- Drafts will be saved to API automatically (not localStorage)
- Requires new API endpoints: `POST /evaluasi/draft/:sopId`, `PATCH /evaluasi/draft/:sopId`, `GET /evaluasi/draft/:sopId`
- The existing `useEvaluasiDraft` hook will be refactored to use API calls instead of localStorage

### Error Handling
- Follow existing pattern: try/catch with `useToast` for user feedback
- Display meaningful error messages from API responses

### Data Transformation
- Maintain current transformation patterns (e.g., `useMemo` to transform API response to component format)
- Do NOT refactor legacy type mappings — focus only on wiring API calls

</decisions>

<specifics>
## Specific Ideas

- ManajemenTimPenyusun.tsx: `timList` is currently `[]` — needs `useTimPenyusun(opdId)` hook that fetches from API
- DetailEvaluasiOPD.tsx: All 6 stub functions need real API hooks + auto-save draft logic
- ManajemenOPD.tsx: Already has `useOpd()` — needs `useOpdMutations()` for create/update/delete
- EvaluasiSOP.tsx: `setSopStatusOverride` is local-only — needs `POST /evaluasi/:sopId/submit`
- ManajemenPeraturan.tsx: `getRiwayatVersi()` returns hardcoded data — needs `GET /peraturan/:id/riwayat`
- DetailSOP.tsx: Version snapshots are `undefined` — needs `GET /sop/:id/versions/:version/snapshot`

## Existing Feature Hooks Reference
- `@/features/organisasi` — useOpd(), usePeraturan()
- `@/features/sop` — useSop(), useDetailSopById(), useEditHistory()
- `@/features/evaluasi` — useEvaluasi(), useEvaluasiDetail(), useRekapEvaluasi(), useEvaluasiDraft()

</specifics>

<canonical_refs>
## Canonical References

- API client: `@/utils/api-client` — `apiClient` instance (axios-based)
- React Query setup: `@tanstack/react-query` in project
- Existing evaluation API: `@/features/evaluasi` — pattern to follow for new hooks

</canonical_refs>
