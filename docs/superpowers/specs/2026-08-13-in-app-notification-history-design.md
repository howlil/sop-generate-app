# Persistent In-App Notification History Design

## Problem

In-app notifications previously reused `PengingatWhatsApp`, a reminder-state table whose rows are intentionally deleted when an evaluation submission changes workflow status. Because the in-app inbox read from the same table, old notifications disappeared whenever reconciliation removed stale reminders. Reconciliation also emitted `notifications.changed` whenever desired reminders existed, even if no observable in-app data changed, causing unnecessary frontend reloads.

## Domain Constraints

- A single OPD may have at most one active `PengajuanEvaluasi` across the actionable workflow statuses.
- Notification recipients are resolved from the workflow status and recipient role.
- A notification is uniquely identified in the business domain by the tuple `(pengajuanEvaluasiId, penggunaId, jenis)`.
- `createdAt` records when the notification was created; it is not part of row identity.
- `PengingatWhatsApp` remains operational reminder state and may be deleted when no longer actionable.
- In-app notification history must remain available after the submission moves to another status.

## Design

`NotifikasiInApp` is a dedicated persistent model with composite primary key `(pengajuanEvaluasiId, penggunaId, jenis)`. It stores `readAt` and `createdAt`. Database foreign keys reference both `PengajuanEvaluasi` and `Pengguna`. Reconciliation creates missing in-app history rows idempotently but never deletes historical rows.

`PengingatWhatsApp` remains responsible for active WhatsApp reminder scheduling, retry, locking, and delivery state. The legacy `inAppReadAt` column is no longer read or written by application code; it is retained only as a backward-compatible migration source for the initial backfill and can be removed in a later schema-cleanup migration after all deployed environments have crossed this migration boundary.

The in-app API does not invent a surrogate notification identifier. A list item exposes `pengajuanEvaluasiId` and `jenis`; `penggunaId` is derived from the authenticated session. Mark-read therefore addresses the natural key through `POST /notifications/:pengajuanEvaluasiId/:jenis/read` while ownership is enforced by the session user.

## Event Semantics

`notifications.changed` is emitted only when observable in-app state changes:

- a new `NotifikasiInApp` row is created;
- one notification is marked read;
- all unread notifications are marked read.

A reconcile cycle that performs only no-op upserts or only removes stale WhatsApp reminder state does not emit an in-app change event.

The client still reloads on initial connection, explicit dropdown open, browser focus, and genuine `notifications.changed` events. Mark-read and mark-all-read update local state immediately instead of performing an additional explicit reload; SSE remains available to synchronize other tabs/sessions.

## Migration

The migration creates `NotifikasiInApp` with the natural composite primary key and database foreign keys, then backfills currently existing reminder rows as the initial in-app history while preserving `inAppReadAt` as `readAt`. Historical rows that had already been deleted by the old reconciler before deployment cannot be reconstructed from reminder state.

Prisma loads the schema directory so the notification model can live in its own `notifications.prisma` file without making the primary schema file larger.

## Verification

Tests and CI must prove that:

1. a desired reminder creates an in-app history row exactly once;
2. changing workflow status may delete stale `PengingatWhatsApp` rows but does not delete `NotifikasiInApp` history;
3. repeated reconciliation with no effective in-app changes does not emit `notifications.changed`;
4. unread count/list/read/read-all operate from `NotifikasiInApp`;
5. mark-read uses `(pengajuanEvaluasiId, penggunaId-from-session, jenis)` rather than a surrogate notification ID;
6. the production migration chain applies successfully on MariaDB;
7. existing WhatsApp reminder scheduling behavior remains intact.
