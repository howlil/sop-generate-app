# Persistent In-App Notification History Design

## Problem

In-app notifications currently reuse `PengingatWhatsApp`, a reminder-state table whose rows are intentionally deleted when an evaluation submission changes workflow status. Because the in-app inbox reads from the same table, old notifications disappear whenever reconciliation removes stale reminders. Reconciliation also emits `notifications.changed` whenever desired reminders exist, even if no reminder data changed, causing unnecessary frontend reloads.

## Domain Constraints

- A single OPD may have at most one active `PengajuanEvaluasi` across the actionable workflow statuses.
- Notification recipients are resolved from the workflow status and recipient role.
- A notification is uniquely identified in the business domain by the tuple `(pengajuanEvaluasiId, penggunaId, jenis)`.
- `createdAt` records when the notification was created; it is not part of row identity.
- `PengingatWhatsApp` remains operational reminder state and may be deleted when no longer actionable.
- In-app notification history must remain available after the submission moves to another status.

## Design

Create a dedicated `NotifikasiInApp` model with composite primary key `(pengajuanEvaluasiId, penggunaId, jenis)`. It references both `PengajuanEvaluasi` and `Pengguna`, stores `readAt` and `createdAt`, and is append-only with respect to workflow reconciliation. Reconciliation creates missing in-app history rows for desired reminders but never deletes historical rows.

`PengingatWhatsApp` remains responsible only for WhatsApp reminder scheduling, retry, locking, and delivery state. The existing `inAppReadAt` column is removed from that model.

The in-app notification service reads and marks rows in `NotifikasiInApp`. The public API may continue exposing a stable string `id`, derived from the composite business key, so the frontend does not need to send `penggunaId` separately; the backend validates the current session user while decoding the identifier.

## Event Semantics

`notifications.changed` is emitted only when observable in-app state changes:

- a new `NotifikasiInApp` row is created;
- one notification is marked read;
- all unread notifications are marked read.

A reconcile cycle that performs only no-op upserts must not emit an in-app change event.

## Migration

Create the `NotifikasiInApp` table and backfill currently existing reminder rows as initial in-app history, preserving their current `inAppReadAt` value as `readAt`. After backfill, drop the in-app-only column/index from `PengingatWhatsApp`.

## Verification

Tests must prove that:

1. a desired reminder creates an in-app history row exactly once;
2. changing workflow status may delete stale `PengingatWhatsApp` rows but does not delete `NotifikasiInApp` history;
3. repeated reconciliation with no effective changes does not emit `notifications.changed`;
4. unread count/list/read/read-all operate from `NotifikasiInApp`;
5. existing WhatsApp reminder scheduling behavior remains intact.
