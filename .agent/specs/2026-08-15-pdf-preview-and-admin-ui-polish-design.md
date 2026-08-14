# PDF Preview and Admin UI Polish Design

## Status

Approved from the screenshot review and follow-up instruction on 2026-08-15. This spec records the agreed implementation scope without changing domain behavior.

## Problem

Four related presentation issues remain after the admin-surface refresh:

1. The public archive PDF can be opened directly but cannot render inside the archive iframe. The public PDF controller returns an inline PDF, while the frontend Nginx adds `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` globally, so the browser blocks same-origin embedding.
2. `/validasi/pdf` uses repeated success cards and stacked panels that over-emphasize status instead of the document and verification result.
3. `/pj-evaluator/opd` manually overrides the shared Tabs visual style and does not use the existing `DataSurface.Actions` slot, so the active-tab create button sits next to search instead of at the right edge.
4. `/pj-evaluator/penyusun` spreads one person across too many columns and renders row actions as a vertical icon stack, making rows taller and harder to scan.

## Goals

- Restore same-origin PDF preview in the public archive without weakening framing protection for the rest of the application.
- Make PDF verification document-first and compact while preserving the current verification API and result semantics.
- Make OPD/Kepala OPD tabs and toolbars follow the shared application primitives.
- Make penyusun rows compact and readable without changing CRUD, move, history, status, or permission behavior.

## Non-goals

- No Prisma, DTO, workflow, authentication, TTE signing, or authorization changes.
- No new PDF storage mechanism.
- No new table library or design-system replacement.
- No global relaxation of clickjacking protection.
- No unrelated refactors.

## Design

### 1. Public archive PDF preview

Keep `GET /api/v1/sop/public/pdf/:detailSopId` and the existing archive iframe. The PDF endpoint already streams `application/pdf` with `Content-Disposition: inline`.

Change the frontend Nginx policy so only `/api/v1/sop/public/pdf/` is allowed to be framed by the same origin. The special location must proxy to the same backend endpoint and return `X-Frame-Options: SAMEORIGIN` plus a CSP that uses `frame-ancestors 'self'`. All other routes retain `X-Frame-Options: DENY` and `frame-ancestors 'none'`.

This is intentionally narrower than removing the headers globally.

### 2. PDF validation page

The page remains public and keeps the same upload, 20 MB validation, base64 conversion, `tteApi.verifyPdf` request, loading/error handling, and signature result data.

Before a file is selected, show a restrained page header and one upload surface. The signing-service availability state is shown as compact helper/status text rather than a full success banner.

After a PDF is selected on desktop, use a document-first workspace:

- left/main: local PDF preview using an object URL in an iframe;
- right: upload/replace action, verify button, and verification result;
- mobile: stack preview then controls/result.

Do not repeat the same “TTE cocok” success message in both a large banner and every result card. Keep signature-level signer, issuer, signing time, app TTE time, and validity badges.

Object URLs must be revoked when the selected file changes or the component unmounts.

### 3. OPD/Kepala OPD management

Use the shared `TabsList` and `TabsTrigger` visual contract instead of page-specific underline classes. Keep the existing controlled `activeTab` behavior and active-tab-specific search query.

Inside `DataSurface.Toolbar`:

- search stays on the left;
- the create action is wrapped in `DataSurface.Actions`, which moves it to the right on `sm+` and wraps naturally on small screens.

No data-fetching or mutation hook changes.

### 4. Penyusun grouped table

Keep the existing grouped-by-OPD disclosure and all existing operations. Reduce the inner table to five columns:

- `Penyusun`: avatar, name, role badge, NIP as secondary metadata;
- `Jabatan`;
- `Kontak`: email and phone as two compact lines;
- `Status`;
- `Aksi`.

Use `RowActions` without vertical wrapping for history, edit, and permanent delete. The grouped header still shows OPD name and count.

Rows must not use card-like decoration, large shadows, or oversized badges.

## Accessibility

- The PDF preview iframe has a descriptive title.
- Upload input retains PDF accept constraints and keyboard accessibility.
- Tabs keep Radix keyboard behavior.
- Search inputs retain `aria-label` values.
- Row actions retain accessible titles.
- Verification feedback remains announced through the existing status/alert semantics.

## Testing

Use TDD for each contract:

1. Nginx configuration test or focused configuration assertion verifies the public PDF location uses same-origin framing while the global default remains deny.
2. `ValidasiPdfPage` tests verify local PDF preview appears after selection, object URL cleanup occurs, the repeated success notice is removed, and verification still calls the API.
3. `ManajemenOPD` tests verify shared tab styling contract and active-tab create action is in the toolbar action slot/right-aligned pattern.
4. `ManajemenPenyusun` tests verify the five-column layout, NIP/contact secondary metadata, and horizontal row actions.

Verification gate: client targeted tests, client typecheck, client lint, client build, relevant server/config tests if present, then repository CI on the pull request.

## Acceptance Criteria

- A published PDF that opens directly can also render inside `/arsip` on the same origin.
- Other app pages remain protected from framing.
- `/validasi/pdf` is document-first and avoids repeated success-card visual noise.
- `/pj-evaluator/opd` uses the standard Tabs primitive appearance.
- Search and create action separate to opposite sides of the toolbar on desktop.
- `/pj-evaluator/penyusun` uses compact five-column rows with horizontal actions.
- Existing behavior and permissions remain unchanged.
- Mandatory CI is green before merge.
