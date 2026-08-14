# PDF Preview and Admin UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore same-origin archive PDF preview and make the PDF validation, OPD management, and penyusun management surfaces compact and consistent without changing domain behavior.

**Architecture:** Keep all existing API, hooks, DTOs, routes, and mutation flows. Fix archive embedding at the Nginx boundary with a route-specific security exception, then make page-level presentation changes using existing Tabs, DataSurface, Table, RowActions, Badge, and status primitives. Add focused component/config tests for each changed contract.

**Tech Stack:** React 19, TypeScript, Vite/TanStack Router, Tailwind CSS, Radix Tabs, Vitest + Testing Library, Nginx, NestJS backend unchanged.

## Global Constraints

- Use one working branch for this task.
- TDD is mandatory: establish a failing test before each implementation change.
- Do not change backend/API/DTO/Prisma/domain behavior.
- Do not globally relax framing/clickjacking protection.
- Do not add a new table or PDF-rendering dependency.
- Keep the implementation pragmatic and reuse existing UI primitives.
- Run targeted tests, typecheck, lint, build, and repository CI before merge.

---

## File Map

- Modify `client/nginx.conf` — add a route-specific same-origin framing policy for the public PDF stream while preserving global deny policy.
- Create `client/src/config/__tests__/nginx-pdf-framing.test.ts` — assert the Nginx security contract from source text.
- Modify `client/src/pages/validasi/ValidasiPdfPage.tsx` — document-first two-column verification workspace, local object URL preview, compact service state, non-duplicated result hierarchy.
- Create `client/src/pages/validasi/__tests__/ValidasiPdfPage.test.tsx` — cover PDF preview lifecycle and verification behavior.
- Modify `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx` — use shared Tabs styling and `DataSurface.Actions` for right-aligned create action.
- Modify `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx` — verify no page-specific line-tab styling and that the primary action uses the action slot.
- Modify `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx` — compact five-column grouped table and horizontal actions.
- Create `client/src/pages/pj-evaluator/penyusun/__tests__/ManajemenPenyusun.test.tsx` — cover the compact row information architecture.

---

### Task 1: Restore same-origin public PDF embedding

**Files:**
- Create: `client/src/config/__tests__/nginx-pdf-framing.test.ts`
- Modify: `client/nginx.conf`

**Interfaces:**
- Consumes: public PDF route `/api/v1/sop/public/pdf/:detailSopId` already returned by the backend/client.
- Produces: an Nginx location `/api/v1/sop/public/pdf/` that proxies to `backend:3001` and allows only same-origin framing.

- [ ] **Step 1: Write the failing config contract test**

Create a Vitest test that reads `client/nginx.conf` and asserts both policies exist:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const nginx = readFileSync(resolve(process.cwd(), 'nginx.conf'), 'utf8')

describe('nginx PDF framing policy', () => {
  it('keeps global frame denial and allows same-origin framing only for public PDF', () => {
    expect(nginx).toContain('add_header X-Frame-Options "DENY" always;')
    expect(nginx).toContain("frame-ancestors 'none'")
    expect(nginx).toContain('location /api/v1/sop/public/pdf/')
    expect(nginx).toContain('add_header X-Frame-Options "SAMEORIGIN" always;')
    expect(nginx).toContain("frame-ancestors 'self'")
  })
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run from `client`:

```bash
pnpm vitest run src/config/__tests__/nginx-pdf-framing.test.ts
```

Expected: FAIL because the public PDF location and SAMEORIGIN policy do not exist.

- [ ] **Step 3: Add the narrow Nginx exception**

Insert a more-specific location before the generic `/api/` block:

```nginx
location /api/v1/sop/public/pdf/ {
    proxy_pass http://backend:3001/api/v1/sop/public/pdf/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'self'; sandbox allow-same-origin;" always;
}
```

Because Nginx `add_header` inheritance stops when a child location defines any `add_header`, the route-specific response receives the explicitly listed same-origin policy instead of the server-level DENY policy.

- [ ] **Step 4: Run the focused test and confirm GREEN**

```bash
pnpm vitest run src/config/__tests__/nginx-pdf-framing.test.ts
```

Expected: PASS.

---

### Task 2: Redesign PDF validation around the selected document

**Files:**
- Create: `client/src/pages/validasi/__tests__/ValidasiPdfPage.test.tsx`
- Modify: `client/src/pages/validasi/ValidasiPdfPage.tsx`

**Interfaces:**
- Consumes: `usePdfSigningStatus()`, `tteApi.verifyPdf(pdfBase64)`, existing DTOs and formatters.
- Produces: local `previewUrl: string | null` derived from `URL.createObjectURL(selectedFile)` and revoked on replacement/unmount; existing verification response shape remains unchanged.

- [ ] **Step 1: Write failing component tests**

Mock `usePdfSigningStatus`, `tteApi.verifyPdf`, and `URL.createObjectURL/revokeObjectURL`. Cover:

```ts
it('shows a local PDF preview after a file is selected', async () => {
  render(<ValidasiPdfPage />)
  const file = new File(['pdf'], 'SOP-1231-v1.pdf', { type: 'application/pdf' })
  await userEvent.upload(screen.getByLabelText(/pilih pdf/i), file)
  expect(URL.createObjectURL).toHaveBeenCalledWith(file)
  expect(screen.getByTitle('Pratinjau PDF SOP-1231-v1.pdf')).toHaveAttribute('src', 'blob:preview')
})

it('revokes the previous object URL when the selected file changes', async () => {
  // upload first.pdf then second.pdf
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1')
})

it('keeps verification working without a duplicate result notice', async () => {
  // upload PDF, click Verifikasi tanda tangan, resolve one matched signature
  expect(tteApi.verifyPdf).toHaveBeenCalledTimes(1)
  expect(screen.getAllByText('TTE ini sudah cocok dengan signature PDF')).toHaveLength(1)
})
```

- [ ] **Step 2: Run the tests and confirm RED**

```bash
pnpm vitest run src/pages/validasi/__tests__/ValidasiPdfPage.test.tsx
```

Expected: FAIL because no local preview exists and matched-result copy is currently duplicated.

- [ ] **Step 3: Implement preview URL lifecycle**

Add state/effect equivalent to:

```ts
const [previewUrl, setPreviewUrl] = useState<string | null>(null)

useEffect(() => {
  if (!selectedFile) {
    setPreviewUrl(null)
    return
  }
  const objectUrl = URL.createObjectURL(selectedFile)
  setPreviewUrl(objectUrl)
  return () => URL.revokeObjectURL(objectUrl)
}, [selectedFile])
```

Keep file validation and verification request untouched.

- [ ] **Step 4: Replace stacked cards with the compact workspace**

Use one restrained page header. Render service availability as a small inline row. When a file is selected, render:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
  <section>{/* iframe preview */}</section>
  <aside>{/* replace/upload control, verify button, error/result */}</aside>
</div>
```

Use:

```tsx
<iframe
  title={`Pratinjau PDF ${selectedFile.name}`}
  src={previewUrl}
  className="min-h-[70vh] w-full border-0 bg-surface"
/>
```

Remove the top-level `ResultNotice` success duplication. For unsigned/failed cases, retain one compact warning/error notice before signature-level details. Keep `SignatureResultCard` as the single matched-signature summary but reduce unnecessary shadow/card emphasis.

- [ ] **Step 5: Run the focused tests and confirm GREEN**

```bash
pnpm vitest run src/pages/validasi/__tests__/ValidasiPdfPage.test.tsx
```

Expected: PASS.

---

### Task 3: Align OPD/Kepala OPD tabs and toolbar with shared primitives

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`

**Interfaces:**
- Consumes: existing controlled Tabs and `DataSurface.Actions`.
- Produces: unchanged active-tab behavior with standard shared tab appearance and desktop-separated toolbar action.

- [ ] **Step 1: Strengthen the failing test**

Add assertions that the active-tab create button is inside the `DataSurface.Actions` slot and page-specific underline styling is absent. Add a stable `data-testid="opd-primary-actions"` only to the local action wrapper if DOM ancestry is otherwise ambiguous.

```ts
const actions = screen.getByTestId('opd-primary-actions')
expect(actions).toContainElement(screen.getByRole('button', { name: 'Tambah OPD' }))
expect(screen.getByRole('tab', { name: 'OPD' }).className).not.toContain('border-b-2')
```

- [ ] **Step 2: Run the test and confirm RED**

```bash
pnpm vitest run src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
```

Expected: FAIL because the page currently uses `border-b-2` underline overrides and the button is not in `DataSurface.Actions`.

- [ ] **Step 3: Use shared tab styles and the actions slot**

Change the page to:

```tsx
<DataSurface.Tabs>
  <TabsList>
    <TabsTrigger value="opd">OPD</TabsTrigger>
    <TabsTrigger value="kepala">Kepala OPD</TabsTrigger>
  </TabsList>
</DataSurface.Tabs>
<DataSurface.Toolbar>
  <SearchInput ... />
  <DataSurface.Actions data-testid="opd-primary-actions">
    <Button ...>{activeTab === 'opd' ? 'Tambah OPD' : 'Tambah Kepala OPD'}</Button>
  </DataSurface.Actions>
</DataSurface.Toolbar>
```

Do not touch search debouncing, queries, refs, mutations, or dialogs.

- [ ] **Step 4: Run the focused test and confirm GREEN**

```bash
pnpm vitest run src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
```

Expected: PASS.

---

### Task 4: Compact penyusun rows to five columns

**Files:**
- Create: `client/src/pages/pj-evaluator/penyusun/__tests__/ManajemenPenyusun.test.tsx`
- Modify: `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`

**Interfaces:**
- Consumes: existing `grup`, person/status primitives, `RowActions`, and all current dialog/mutation handlers.
- Produces: five-column presentation only; no data/model change.

- [ ] **Step 1: Write the failing compact-row test**

Mock `useOpd`, `usePenyusun`, dialogs, and router dependencies. Render one group with one penyusun and assert:

```ts
expect(screen.getByRole('columnheader', { name: 'Penyusun' })).toBeInTheDocument()
expect(screen.getByRole('columnheader', { name: 'Jabatan' })).toBeInTheDocument()
expect(screen.getByRole('columnheader', { name: 'Kontak' })).toBeInTheDocument()
expect(screen.queryByRole('columnheader', { name: 'NIP' })).not.toBeInTheDocument()
expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument()
expect(screen.queryByRole('columnheader', { name: 'No. HP' })).not.toBeInTheDocument()
expect(screen.getByText('198501012009011004')).toBeInTheDocument()
expect(screen.getByText('penyusun.dinkes@gmail.com')).toBeInTheDocument()
expect(screen.getByText('6281234567894')).toBeInTheDocument()
```

- [ ] **Step 2: Run the test and confirm RED**

```bash
pnpm vitest run src/pages/pj-evaluator/penyusun/__tests__/ManajemenPenyusun.test.tsx
```

Expected: FAIL because the table currently has separate NIP, Email, and No. HP headers.

- [ ] **Step 3: Implement the five-column row**

Change headers to `Penyusun`, `Jabatan`, `Kontak`, `Status`, `Aksi`.

Inside the identity cell keep the existing avatar/name and role badge, then add NIP below in subdued mono text. Inside `Kontak`, render email and phone as compact, truncatable lines with `title` attributes.

Change:

```tsx
<RowActions wrap actions={[...]} />
```

to:

```tsx
<RowActions actions={[...]} />
```

Keep the same three actions and handlers.

- [ ] **Step 4: Run the focused test and confirm GREEN**

```bash
pnpm vitest run src/pages/pj-evaluator/penyusun/__tests__/ManajemenPenyusun.test.tsx
```

Expected: PASS.

---

### Task 5: Regression verification and integration

**Files:**
- No new production files expected.
- Update tests only if failures reveal an intended contract change already covered by the approved design.

**Interfaces:**
- Produces: merge-ready branch with no known regression.

- [ ] **Step 1: Run all touched tests together**

```bash
pnpm vitest run \
  src/config/__tests__/nginx-pdf-framing.test.ts \
  src/pages/validasi/__tests__/ValidasiPdfPage.test.tsx \
  src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx \
  src/pages/pj-evaluator/penyusun/__tests__/ManajemenPenyusun.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run client typecheck**

```bash
pnpm typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run client lint**

```bash
pnpm lint
```

Expected: exit 0.

- [ ] **Step 4: Run client build**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 5: Run relevant E2E/static audit if supported locally**

```bash
pnpm playwright test e2e/pdf-verification.spec.ts e2e/journeys/public-integrity.spec.ts
```

If the repo requires external services for these E2E tests and they cannot run locally, do not fake success; rely on the repository CI job and record the local limitation.

- [ ] **Step 6: Review the diff for scope**

Confirm there are no changes to backend domain behavior, API shapes, auth, permissions, or unrelated UI.

- [ ] **Step 7: Open one PR and wait for mandatory CI**

Use a concise PR title such as `fix(client): restore PDF preview and compact admin UI` and summarize the four changes plus verification performed.

- [ ] **Step 8: Squash merge and delete the working branch after mandatory CI is green**

Do not create a second branch or PR for follow-up fixes in this task; continue on the same branch until green.
