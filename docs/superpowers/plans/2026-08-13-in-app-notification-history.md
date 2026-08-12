# Persistent In-App Notification History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve in-app notification history across evaluation status changes while keeping WhatsApp reminder state ephemeral and eliminating no-op notification reload events.

**Architecture:** Add a dedicated `NotifikasiInApp` persistence model keyed by `(pengajuanEvaluasiId, penggunaId, jenis)`. Reconciliation creates missing history records but only deletes stale `PengingatWhatsApp` rows. The in-app API moves its reads and read-state mutations to the new table, while SSE events are emitted only for actual in-app mutations.

**Tech Stack:** NestJS, TypeScript, Prisma, MySQL, Jest, React client consuming the existing notification API.

## Global Constraints

- Work directly on `main` as requested.
- Preserve the existing notification HTTP response shape used by the client.
- Do not introduce a surrogate `notifikasiId` column.
- Use `(pengajuanEvaluasiId, penggunaId, jenis)` as the natural composite primary key.
- `createdAt` remains a timestamp attribute and is not part of the primary key.
- Do not delete historical `NotifikasiInApp` rows during reminder reconciliation.
- Keep `PengingatWhatsApp` focused on active WhatsApp reminder delivery state.

---

### Task 1: Persist in-app history independently

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/migrations/20260813014000_separate_in_app_notification_history/migration.sql`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.repository.ts`
- Test: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.spec.ts`

**Interfaces:**
- Produces repository methods `createInAppNotificationIfMissing(...)`, `countUnreadInApp(...)`, `findInAppNotifications(...)`, `markInAppRead(...)`, and `markAllInAppRead(...)` backed by `NotifikasiInApp`.
- Existing WhatsApp reminder repository methods keep their current contract.

- [ ] **Step 1: Write failing reconciliation/repository tests**

Add cases proving that a desired reminder creates one history row, repeated reconciliation does not duplicate it, and stale WhatsApp reminder deletion does not remove history.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm test -- notification-reminder-reconciler.service.spec.ts --runInBand`

Expected: FAIL because persistent in-app history methods do not exist yet.

- [ ] **Step 3: Add Prisma model and migration**

Add `NotifikasiInApp` with fields `pengajuanEvaluasiId`, `penggunaId`, `jenis`, `readAt`, and `createdAt`, relations to `PengajuanEvaluasi` and `Pengguna`, and `@@id([pengajuanEvaluasiId, penggunaId, jenis])`. Migration creates/backfills the table from current reminders, then removes `inAppReadAt` and its old index from `PengingatWhatsApp`.

- [ ] **Step 4: Implement repository persistence**

Use idempotent `upsert`/create semantics for history creation and point all in-app list/count/read methods at `NotifikasiInApp`.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `npm test -- notification-reminder-reconciler.service.spec.ts --runInBand`

Expected: PASS.

### Task 2: Emit SSE only for real in-app changes

**Files:**
- Modify: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder-reconciler.service.spec.ts`

**Interfaces:**
- `reconcile()` continues returning `{ desired, deleted }` for compatibility.
- `notifications.changed` is emitted only for users whose in-app history gained a row, plus explicit read/read-all mutations handled by `InAppNotificationService`.

- [ ] **Step 1: Add failing no-op event test**

Prove that a reconcile where all desired history already exists emits no `notifications.changed` event.

- [ ] **Step 2: Run focused test and confirm RED**

Run: `npm test -- notification-reminder-reconciler.service.spec.ts --runInBand`

Expected: FAIL because current code emits for every desired reminder on every cycle.

- [ ] **Step 3: Implement mutation-aware event emission**

Have history creation return whether a row was newly created, collect only affected user IDs, and emit events only for those users. Stale WhatsApp reminder deletion alone must not erase or recreate history.

- [ ] **Step 4: Run focused test and confirm GREEN**

Run: `npm test -- notification-reminder-reconciler.service.spec.ts --runInBand`

Expected: PASS.

### Task 3: Preserve the existing in-app API contract

**Files:**
- Modify: `server/src/modules/notifications/reminders/in-app-notification.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.types.ts`
- Modify: `server/src/modules/notifications/reminders/in-app-notification.service.spec.ts`
- Modify if needed: `server/src/modules/notifications/reminders/in-app-notification.controller.ts`

**Interfaces:**
- `findMine()` still returns `InAppReminderNotification[]` with `id`, `pengajuanEvaluasiId`, `kind`, `title`, `preview`, `body`, `readAt`, `createdAt`, and `updatedAt` compatibility where required by the DTO.
- `markRead()` continues accepting the existing route identifier while resolving it safely to the composite key and enforcing current-session ownership.

- [ ] **Step 1: Add failing service tests for list/read/read-all on history rows**

Cover unread count, list ordering, single read, read-all, and not-found/ownership behavior.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm test -- in-app-notification.service.spec.ts --runInBand`

Expected: FAIL against the old reminder-backed implementation.

- [ ] **Step 3: Implement composite-key-backed in-app service**

Keep the client-facing API stable while all persistence goes through `NotifikasiInApp`. If the existing `:notificationId` route cannot represent the natural key without a surrogate ID, encode/decode the composite business key deterministically rather than adding a database ID.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `npm test -- in-app-notification.service.spec.ts --runInBand`

Expected: PASS.

### Task 4: Regression verification

**Files:**
- Verify: notification reminder tests, notification service tests, Prisma schema/migration, and server build.

**Interfaces:**
- No new public frontend contract.
- WhatsApp worker behavior remains unchanged.

- [ ] **Step 1: Run notification test suite**

Run: `npm test -- notifications --runInBand`

Expected: PASS.

- [ ] **Step 2: Validate Prisma schema**

Run: `npx prisma validate`

Expected: schema valid.

- [ ] **Step 3: Build server**

Run: `npm run build`

Expected: PASS with no TypeScript errors.

- [ ] **Step 4: Review the final diff for scope**

Confirm no unrelated refactors, no surrogate in-app notification ID, history survives stale reminder cleanup, and no-op reconcile does not emit notification-change SSE events.
