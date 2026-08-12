# Persistent In-App Notification History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve in-app notification history across evaluation status changes while keeping WhatsApp reminder state ephemeral and eliminating no-op notification reload events.

**Architecture:** `NotifikasiInApp` is keyed by `(pengajuanEvaluasiId, penggunaId, jenis)`. Reconciliation creates missing history records but only deletes stale `PengingatWhatsApp` rows. The in-app API reads and mutates read state in the history table, while SSE events are emitted only for actual in-app mutations.

**Tech Stack:** NestJS, TypeScript, Prisma, MariaDB/MySQL, Jest, React.

## Global Constraints

- Work directly on `main` as requested.
- Do not introduce a surrogate `notifikasiId` column.
- Use `(pengajuanEvaluasiId, penggunaId, jenis)` as the natural composite primary key.
- `createdAt` remains a timestamp attribute and is not part of the primary key.
- Do not delete historical `NotifikasiInApp` rows during reminder reconciliation.
- Keep `PengingatWhatsApp` focused on active WhatsApp reminder delivery state.
- `penggunaId` for mark-read comes from the authenticated session, not from the client payload.

---

### Task 1: Persist in-app history independently

**Files:**
- Modify: `server/prisma.config.ts`
- Create: `server/prisma/notifications.prisma`
- Create: `server/prisma/migrations/20260813015000_separate_in_app_notification_history/migration.sql`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.repository.ts`
- Test: `server/src/modules/notifications/reminders/notification-reminder.repository.spec.ts`
- Test: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.spec.ts`

- [x] **Step 1: Write failing reconciliation tests**

RED was confirmed in CI after lint/typecheck: the reconciler tests failed because `createInAppNotificationIfMissing` did not yet exist.

- [x] **Step 2: Add Prisma model and migration**

Prisma now loads the `prisma` schema directory. `NotifikasiInApp` uses `@@id([pengajuanEvaluasiId, penggunaId, jenis])`. The SQL migration creates database foreign keys to `PengajuanEvaluasi` and `Pengguna` and backfills current reminder rows, preserving `inAppReadAt` as `readAt`.

- [x] **Step 3: Implement repository persistence**

History creation uses `createMany(..., skipDuplicates: true)` so the natural key provides idempotency. In-app list/count/read/read-all now use `NotifikasiInApp`.

- [x] **Step 4: Add persistence regression tests**

Repository tests assert natural-key creation, duplicate handling, unread counting, and mark-read behavior against `notifikasiInApp`.

### Task 2: Emit SSE only for real in-app changes

**Files:**
- Modify: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.spec.ts`

- [x] **Step 1: Add no-op/stale-cleanup event tests**

Tests require that repeated reconciliation and stale WhatsApp cleanup do not emit in-app change events.

- [x] **Step 2: Implement mutation-aware event emission**

The reconciler emits `notifications.changed` only for users whose history gained a new row. Deleting stale WhatsApp reminder state does not emit an in-app event and never deletes history.

### Task 3: Use the natural key through the API and client

**Files:**
- Modify: `server/src/modules/notifications/reminders/in-app-notification.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.types.ts`
- Modify: `server/src/modules/notifications/reminders/in-app-notification.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/in-app-notification.controller.ts`
- Modify: `client/src/types/dto/notifications.dto.ts`
- Modify: `client/src/api/notifications.ts`
- Modify: `client/src/hooks/useInAppNotifications.ts`
- Modify: `client/src/components/layout/NotificationBell.tsx`

- [x] **Step 1: Add failing service tests for history-backed list/read/read-all**

Tests define the response without a surrogate notification ID and require mark-read to use `(pengajuanEvaluasiId, penggunaId, jenis)`.

- [x] **Step 2: Implement natural-key-backed in-app service and route**

`POST /notifications/:pengajuanEvaluasiId/:jenis/read` uses `penggunaId` from JWT/session. The list response exposes `pengajuanEvaluasiId` and `jenis` rather than an invented ID.

- [x] **Step 3: Update frontend identity and reload behavior**

React uses `${pengajuanEvaluasiId}:${jenis}` as the item key. Mark-read passes the natural key. Read/read-all update local state immediately instead of performing a second explicit reload on top of the SSE event.

### Task 4: Regression verification

**Files:**
- Modify: `server/test/integration/helpers/integration-database.util.ts`
- Verify: server/client quality, Prisma schema/migrations, MariaDB invariants, E2E journeys, container build.

- [x] **Step 1: Include `NotifikasiInApp` in integration database reset**

This prevents historical rows from leaking between integration scenarios.

- [x] **Step 2: Validate Prisma schema and production migration chain**

CI has already demonstrated successful Prisma generation, schema validation, and application of the migration chain against MariaDB on an implementation commit.

- [x] **Step 3: Run server and client quality gates**

A complete implementation CI run passed server typecheck/lint/unit/build and client typecheck/lint/unit/build. The final run after documentation/tests must still finish before completion is claimed.

- [ ] **Step 4: Complete final CI run**

Required final evidence: database invariants, critical E2E journeys, and container build all succeed on the final `main` commit.
