# Wago Delivery Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add durable signed Wago delivery-webhook ingestion to SOPFlow so every outbound WhatsApp reminder occurrence can be correlated to `message.server_accepted` / `message.rejected`, with safe five-minute retry acceleration only for the latest still-actionable `MESSAGE_REJECTED` attempt.

**Architecture:** Keep `PengingatWhatsApp` as active reminder lifecycle state. Add `PengirimanNotifikasiWhatsApp` for transport-attempt history and `WagoWebhookEvent` as a durable inbox keyed by `Webhook-Id`. `WagoProvider` returns a provider-neutral receipt; the webhook boundary authenticates the exact raw request body before parsing/trusting the envelope; the webhook service resolves terminal delivery state and can only shorten `nextSendAt`, never call the worker directly.

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7 schema-folder + MariaDB/MySQL, Jest 30, Zod, Node `crypto`, existing notification scheduler.

## Global Constraints

- Branch: `feat/wago-delivery-webhook` only.
- TDD for each behavior: RED test, verify failure, minimal GREEN, verify pass.
- Business code uses `transportMessageId`, never a Wago-specific message-ID property name.
- Wago webhook schema: version `1` only.
- Events: `message.server_accepted`, `message.rejected` only.
- Signing material: `<Webhook-Id>.<Webhook-Timestamp>.<exact raw JSON body>`.
- HMAC-SHA256; Base64 signature payload; `timingSafeEqual` only for equal byte lengths.
- Timestamp tolerance: ±300 seconds.
- `MESSAGE_REJECTED`: latest + still-eligible attempt may shorten schedule to `min(existingNextSendAt, now + 5 minutes)`.
- `REACHOUT_RESTRICTED`: history update only; no accelerated retry.
- Unknown/empty rejection error: history update only; no accelerated retry.
- Duplicate `Webhook-Id`: `2xx` idempotent no-op.
- Stale attempt, deleted reminder, or no-longer-actionable reminder: delivery history may update; schedule must not.
- First terminal state wins: `PENDING -> ACCEPTED|REJECTED`; terminal -> terminal is no-op.
- No direct `PushReminderWorkerService.processDue()` invocation from webhook code.
- No Redis/Kafka/new queue/global polling/frontend webhook UI/inbound WhatsApp/recipient auto-allow.
- Never keep a DB transaction open across the Wago HTTP request.
- Webhook secret is optional for deployment; outbound Wago still works without it, but callback endpoint never accepts unsigned traffic.
- Wago `409 DUPLICATE_MESSAGE` does not expose the original `messageId`; do not invent correlation if a crash lost the first receipt.

---

## Locked File Map

```text
server/prisma/schema.prisma
server/prisma/notifications.prisma
server/prisma/migrations/20260813090000_add_wago_delivery_webhook_state/migration.sql

server/src/modules/notifications/reminders/
├── deliveries/
│   ├── notification-delivery.types.ts
│   ├── notification-delivery.repository.ts
│   ├── notification-delivery.repository.spec.ts
│   ├── notification-delivery.service.ts
│   └── notification-delivery.service.spec.ts
├── webhooks/
│   ├── wago-webhook.types.ts
│   ├── wago-webhook-signature.service.ts
│   ├── wago-webhook-signature.service.spec.ts
│   ├── wago-webhook.repository.ts
│   ├── wago-webhook.repository.spec.ts
│   ├── wago-webhook.service.ts
│   ├── wago-webhook.service.spec.ts
│   ├── wago-webhook.controller.ts
│   └── wago-webhook.controller.spec.ts
├── providers/
│   ├── notification-channel.interface.ts
│   ├── wago.provider.ts
│   └── wago.provider.spec.ts
├── notification-reminder.repository.ts
├── push-reminder-worker.service.ts
├── push-reminder-worker.service.spec.ts
└── notification.module.ts

server/src/common/http/raw-body.ts
server/src/main.ts
server/src/config/env.validation.ts
server/src/config/env.validation.spec.ts
server/test/integration/helpers/integration-database.util.ts

.env.example
server/.env.test
compose.yml
README.md
```

`schema.prisma` contains the existing `PengingatWhatsApp` model; `notifications.prisma` is the notification-specific schema fragment. The new history/inbox models live in `notifications.prisma`, while `PengingatWhatsApp` receives its inverse relation in `schema.prisma`.

---

### Task 1: Database Model and Delivery Repository

**Files:**
- Modify: `server/prisma/schema.prisma`
- Modify: `server/prisma/notifications.prisma`
- Create: `server/prisma/migrations/20260813090000_add_wago_delivery_webhook_state/migration.sql`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.types.ts`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.ts`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.spec.ts`
- Modify: `server/test/integration/helpers/integration-database.util.ts`

**Produces:**

```ts
export type CreatePendingNotificationDelivery = Readonly<{
  notificationReminderId: string;
  pengajuanEvaluasiId: string;
  penggunaId: string;
  kind: JenisPengingatWhatsApp;
  idempotencyKey: string;
  transportMessageId: string | null;
  submittedAt: Date;
}>;
```

Repository methods:

```ts
createOrGetPending(input: CreatePendingNotificationDelivery): Promise<NotificationDeliveryRecord>;
findByTransportMessageId(messageId: string): Promise<NotificationDeliveryRecord | null>;
findLatestForIdentity(pengajuanEvaluasiId: string, penggunaId: string, kind: JenisPengingatWhatsApp): Promise<NotificationDeliveryRecord | null>;
markAccepted(id: string, resolvedAt: Date): Promise<'updated' | 'already-terminal'>;
markRejected(id: string, errorCode: string | null, resolvedAt: Date): Promise<'updated' | 'already-terminal'>;
```

- [ ] **Step 1: Add RED repository tests**

Use a typed Prisma mock consistent with existing repository specs. Cover:

```ts
it('reuses the same logical delivery by unique idempotency key', async () => {
  prisma.pengirimanNotifikasiWhatsApp.findUnique.mockResolvedValueOnce(existingRow);

  const result = await repository.createOrGetPending({
    notificationReminderId: '11111111-1111-1111-1111-111111111111',
    pengajuanEvaluasiId: '22222222-2222-2222-2222-222222222222',
    penggunaId: '33333333-3333-3333-3333-333333333333',
    kind: JenisPengingatWhatsApp.EVALUASI_SOP,
    idempotencyKey: 'sopflow-reminder:11111111-1111-1111-1111-111111111111:initial',
    transportMessageId: 'wamid-1',
    submittedAt: new Date('2026-08-13T08:00:00.000Z'),
  });

  expect(result.idempotencyKey).toBe(existingRow.idempotencyKey);
  expect(prisma.pengirimanNotifikasiWhatsApp.create).not.toHaveBeenCalled();
});
```

Also cover create path, lookup by message ID, latest identity ordering, and terminal first-write-wins.

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest notification-delivery.repository.spec.ts --runInBand
```

Expected: module/model/repository missing.

- [ ] **Step 3: Add Prisma schema + migration**

Add:

```prisma
enum StatusPengirimanNotifikasiWhatsApp {
  PENDING
  ACCEPTED
  REJECTED
}

model PengirimanNotifikasiWhatsApp {
  pengirimanNotifikasiWhatsAppId String                             @id @default(uuid()) @db.Char(36)
  pengingatWhatsAppId            String?                            @db.Char(36)
  pengajuanEvaluasiId            String                             @db.Char(36)
  penggunaId                     String                             @db.Char(36)
  jenis                          JenisPengingatWhatsApp
  idempotencyKey                 String                             @unique @db.VarChar(191)
  transportMessageId             String?                            @unique @db.VarChar(191)
  status                         StatusPengirimanNotifikasiWhatsApp @default(PENDING)
  errorCode                      String?                            @db.VarChar(64)
  submittedAt                    DateTime                           @db.DateTime(3)
  resolvedAt                     DateTime?                          @db.DateTime(3)
  createdAt                      DateTime                           @default(now()) @db.DateTime(3)
  updatedAt                      DateTime                           @updatedAt @db.DateTime(3)
  pengingatWhatsApp              PengingatWhatsApp?                 @relation(fields: [pengingatWhatsAppId], references: [pengingatWhatsAppId], onDelete: SetNull)

  @@index([pengajuanEvaluasiId, penggunaId, jenis, submittedAt], map: "PengirimanNotifikasi_identity_submitted_idx")
  @@index([pengingatWhatsAppId, submittedAt], map: "PengirimanNotifikasi_reminder_submitted_idx")
}

model WagoWebhookEvent {
  webhookId           String    @id @db.VarChar(191)
  transportMessageId  String    @db.VarChar(191)
  event               String    @db.VarChar(64)
  status              String    @db.VarChar(16)
  errorCode           String?   @db.VarChar(64)
  sourceCreatedAt     DateTime  @db.DateTime(3)
  receivedAt          DateTime  @db.DateTime(3)
  processedAt         DateTime? @db.DateTime(3)
  createdAt           DateTime  @default(now()) @db.DateTime(3)

  @@index([transportMessageId, processedAt], map: "WagoWebhook_message_processed_idx")
}
```

Add `pengirimanNotifikasiWhatsApp PengirimanNotifikasiWhatsApp[]` to `PengingatWhatsApp`.

Migration must create the two tables, enum representation generated for MySQL/MariaDB, unique indexes on `idempotencyKey` and nullable `transportMessageId`, lookup indexes, and FK `PengirimanNotifikasiWhatsApp.pengingatWhatsAppId -> PengingatWhatsApp.pengingatWhatsAppId ON DELETE SET NULL`.

- [ ] **Step 4: Implement repository minimally**

`createOrGetPending` queries by `idempotencyKey` first and creates only if absent. Terminal updates use `updateMany({ where: { id, status: PENDING } })`; if count is zero, return `already-terminal`.

- [ ] **Step 5: Validate GREEN**

```bash
cd server
pnpm prisma validate
pnpm prisma generate
pnpm jest notification-delivery.repository.spec.ts --runInBand
```

- [ ] **Step 6: Commit**

```bash
git add server/prisma server/src/modules/notifications/reminders/deliveries server/test/integration/helpers/integration-database.util.ts
git commit -m "feat: persist notification delivery attempts"
```

---

### Task 2: Provider-neutral Transport Receipt

**Files:**
- Modify: `server/src/modules/notifications/reminders/providers/notification-channel.interface.ts`
- Modify: `server/src/modules/notifications/reminders/providers/wago.provider.ts`
- Modify: `server/src/modules/notifications/reminders/providers/wago.provider.spec.ts`

**Produces:**

```ts
export type NotificationSendReceipt = Readonly<{
  transportMessageId: string | null;
  status: 'pending';
}>;
```

`NotificationChannel.send(...)` returns `Promise<NotificationSendReceipt>`.

- [ ] **Step 1: RED tests**

Assert HTTP `202 { messageId: 'm1', status: 'pending' }` resolves to:

```ts
{ transportMessageId: 'm1', status: 'pending' }
```

Add a `202` with absent/non-string `messageId` returning null correlation. Update the existing `409 DUPLICATE_MESSAGE` test to resolve logical success as:

```ts
{ transportMessageId: null, status: 'pending' }
```

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest wago.provider.spec.ts --runInBand
```

- [ ] **Step 3: GREEN implementation**

On `response.ok`, parse JSON safely and normalize only `messageId`; do not require a message ID to consider Wago submission successful. Keep all existing error mappings unchanged.

- [ ] **Step 4: Verify GREEN**

```bash
cd server
pnpm jest wago.provider.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/notifications/reminders/providers
git commit -m "refactor: return transport receipts from notification channels"
```

---

### Task 3: Record Delivery Receipt in Reminder Worker

**Files:**
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.ts`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/notification.module.ts`

**Produces:**

```ts
recordSubmission(
  reminder: ClaimedNotificationReminder,
  idempotencyKey: string,
  receipt: NotificationSendReceipt,
  submittedAt: Date,
): Promise<NotificationDeliveryRecord>;
```

- [ ] **Step 1: RED worker/service tests**

Mock channel success:

```ts
channel.send.mockResolvedValue({ transportMessageId: 'wamid-1', status: 'pending' });
```

Assert `recordSubmission` receives reminder snapshot + exact idempotency key before `markSuccess`. Assert an existing idempotency-key row is reused rather than duplicated.

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest push-reminder-worker.service.spec.ts notification-delivery.service.spec.ts --runInBand
```

- [ ] **Step 3: Implement delivery service**

At this task the service only persists through `NotificationDeliveryRepository`. Race reconciliation is attached in Task 6 after the webhook service exists; do not introduce a placeholder callback or circular dependency now.

- [ ] **Step 4: Update worker**

Use one stable local key:

```ts
const idempotencyKey = this.buildIdempotencyKey(reminder);
const receipt = await this.channel.send(reminder.destination, message.body, { idempotencyKey });
const sentAt = new Date();
await this.deliveryService.recordSubmission(reminder, idempotencyKey, receipt, sentAt);
await this.repository.markSuccess(
  notificationReminderId,
  lockToken,
  sentAt,
  new Date(sentAt.getTime() + this.reminderIntervalMs),
);
```

Do not alter failure/backoff semantics.

- [ ] **Step 5: Verify GREEN**

```bash
cd server
pnpm jest push-reminder-worker.service.spec.ts notification-delivery.service.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/notifications/reminders
git commit -m "feat: record Wago reminder delivery attempts"
```

---

### Task 4: Raw-body Capture, Secret Validation, Signature Verification

**Files:**
- Create: `server/src/common/http/raw-body.ts`
- Modify: `server/src/main.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.types.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook-signature.service.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook-signature.service.spec.ts`
- Modify: `server/src/config/env.validation.ts`
- Modify: `server/src/config/env.validation.spec.ts`

**Produces:**

```ts
export type WagoSignatureInput = Readonly<{
  webhookId: string;
  timestamp: string;
  signatureHeader: string;
  rawBody: Buffer;
}>;

verify(input: WagoSignatureInput, now?: Date): void;
```

- [ ] **Step 1: RED signature tests**

Cover valid HMAC, modified raw body, two space-separated rotation signatures where either may match, malformed entries, stale timestamp (>300s), too-far future timestamp, and secret missing.

Signing fixture:

```ts
const material = `${webhookId}.${timestamp}.${rawBody.toString('utf8')}`;
const signature = createHmac('sha256', secret).update(material).digest('base64');
```

- [ ] **Step 2: RED environment tests**

Assert empty `WAGO_WEBHOOK_SECRET` normalizes to absent/disabled, >=32-character non-empty secret succeeds, short non-empty secret fails, and existing `WAGO_BASE_URL`/`WAGO_API_KEY` pairing remains independent.

- [ ] **Step 3: Verify RED**

```bash
cd server
pnpm jest wago-webhook-signature.service.spec.ts env.validation.spec.ts --runInBand
```

- [ ] **Step 4: Capture exact raw bytes**

Create:

```ts
import type { Request } from 'express';

export type RequestWithRawBody = Request & { rawBody?: Buffer };
```

Change only the current JSON parser setup:

```ts
app.useBodyParser('json', {
  limit: JSON_BODY_LIMIT,
  verify: (req, _res, buffer) => {
    (req as RequestWithRawBody).rawBody = Buffer.from(buffer);
  },
});
```

Do not add another JSON parser.

- [ ] **Step 5: Implement verifier**

Rules: strict integer Unix seconds, `abs(nowSec - timestampSec) <= 300`, parse space-separated `v1,<base64>`, HMAC raw UTF-8 material, decode candidate, compare only equal lengths with `timingSafeEqual`.

- [ ] **Step 6: Verify GREEN**

```bash
cd server
pnpm jest wago-webhook-signature.service.spec.ts env.validation.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 7: Commit**

```bash
git add server/src/common/http/raw-body.ts server/src/main.ts server/src/config server/src/modules/notifications/reminders/webhooks
git commit -m "feat: verify signed Wago webhook requests"
```

---

### Task 5: Durable Webhook Inbox

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.repository.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.repository.spec.ts`

**Produces:**

```ts
insertIfNew(event: TrustedWagoWebhookEvent, receivedAt: Date): Promise<'inserted' | 'duplicate'>;
findUnprocessedByTransportMessageId(messageId: string): Promise<WagoWebhookInboxRecord[]>;
markProcessed(webhookId: string, processedAt: Date): Promise<boolean>;
```

- [ ] **Step 1: RED repository tests**

Cover first insert, duplicate `Webhook-Id`, unmatched remains `processedAt=null`, and deterministic unprocessed lookup by `transportMessageId` ordered by `sourceCreatedAt`, then `receivedAt`, then `webhookId`.

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest wago-webhook.repository.spec.ts --runInBand
```

- [ ] **Step 3: Implement DB-backed dedup**

Use the `webhookId` primary key and Prisma `createMany({ skipDuplicates: true })` or an equivalent unique-safe insertion. Do not use process memory for idempotency.

- [ ] **Step 4: Verify GREEN**

```bash
cd server
pnpm jest wago-webhook.repository.spec.ts --runInBand
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/notifications/reminders/webhooks/wago-webhook.repository*
git commit -m "feat: persist and deduplicate Wago webhook events"
```

---

### Task 6: Webhook Resolution and Safe Retry Acceleration

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.service.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.ts`
- Modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.ts`
- Modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.repository.ts`

**Produces:**

```ts
ingest(event: TrustedWagoWebhookEvent, receivedAt: Date): Promise<'processed' | 'stored-unmatched' | 'duplicate'>;
reconcileTransportMessage(transportMessageId: string): Promise<void>;
```

- [ ] **Step 1: RED policy tests**

Cover all branches:

```ts
it('shortens only the latest eligible MESSAGE_REJECTED attempt by five minutes', async () => {
  await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);
  expect(reminderRepository.accelerateNextSendAt).toHaveBeenCalledWith(
    '11111111-1111-1111-1111-111111111111',
    new Date(now.getTime() + 300_000),
  );
});
```

Also cover `REACHOUT_RESTRICTED`, empty error, unknown error, stale delivery, deleted reminder, no-longer-eligible reminder, duplicate webhook ID, unmatched event, later reconciliation, and accepted->rejected / rejected->accepted contradiction.

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest wago-webhook.service.spec.ts notification-delivery.service.spec.ts --runInBand
```

- [ ] **Step 3: Add active-reminder lookup + atomic shortening**

Add repository methods:

```ts
findByIdentity(pengajuanEvaluasiId: string, penggunaId: string, kind: JenisPengingatWhatsApp): Promise<ClaimedNotificationReminder | null>;
accelerateNextSendAt(notificationReminderId: string, candidate: Date): Promise<boolean>;
```

`findByIdentity` returns the same domain shape used by `isReminderStillEligible`; do not duplicate the status/role/OPD eligibility rule.

`accelerateNextSendAt` uses:

```ts
where: { pengingatWhatsAppId: notificationReminderId, nextSendAt: { gt: candidate } }
data: { nextSendAt: candidate }
```

It does not touch locks/failure counters.

- [ ] **Step 4: Implement terminal + latest-attempt guards**

1. Match by `transportMessageId`.
2. Resolve delivery terminal state only if current state is `PENDING`.
3. Find latest delivery by snapshot identity.
4. Scheduling side effect is allowed only when matched delivery ID equals latest delivery ID.
5. Load current active reminder by natural identity and call `isReminderStillEligible`.
6. Only `MESSAGE_REJECTED` calls `accelerateNextSendAt(..., now+300000)`.
7. Mark inbox processed after matched event handling succeeds.

- [ ] **Step 5: Attach race reconciliation without circular dependency**

`WagoWebhookService` depends directly on `NotificationDeliveryRepository`, not `NotificationDeliveryService`.

`NotificationDeliveryService` depends on `WagoWebhookService` solely to call `reconcileTransportMessage()` after a non-null message ID is persisted. Dependency direction is one-way:

```text
NotificationDeliveryService -> WagoWebhookService -> NotificationDeliveryRepository
```

No reverse service dependency exists.

- [ ] **Step 6: Verify GREEN**

```bash
cd server
pnpm jest wago-webhook.service.spec.ts notification-delivery.service.spec.ts push-reminder-worker.service.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 7: Commit**

```bash
git add server/src/modules/notifications/reminders
git commit -m "feat: reconcile Wago delivery webhooks with reminder retries"
```

---

### Task 7: HTTP Webhook Controller and Module Wiring

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.controller.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.controller.spec.ts`
- Modify: `server/src/modules/notifications/reminders/notification.module.ts`

**Endpoint:** `POST /api/v1/webhooks/wago`

- [ ] **Step 1: RED controller tests**

Cover: valid accepted event, valid rejected event, duplicate event (`2xx`), durably stored unmatched event (`2xx`), missing raw body, missing required headers, bad signature, header/body ID mismatch, `X-Wago-Event` mismatch, unsupported version, invalid event/status pair, missing receiver secret (`503`), and service persistence failure (`5xx`).

- [ ] **Step 2: Verify RED**

```bash
cd server
pnpm jest wago-webhook.controller.spec.ts --runInBand
```

- [ ] **Step 3: Implement strict post-auth envelope parsing**

After signature verification, validate with:

```ts
const envelopeSchema = z.discriminatedUnion('event', [
  z.object({
    version: z.literal('1'),
    id: z.string().min(1),
    event: z.literal('message.server_accepted'),
    createdAt: z.string().datetime(),
    data: z.object({ messageId: z.string().min(1), status: z.literal('accepted') }),
  }),
  z.object({
    version: z.literal('1'),
    id: z.string().min(1),
    event: z.literal('message.rejected'),
    createdAt: z.string().datetime(),
    data: z.object({
      messageId: z.string().min(1),
      status: z.literal('rejected'),
      error: z.string().max(64).optional(),
    }),
  }),
]);
```

Require body `id === Webhook-Id` and body `event === X-Wago-Event`.

- [ ] **Step 4: Wire controller/services**

Register controller, signature service, inbox repository, webhook service, delivery repository/service, and keep `NOTIFICATION_CHANNEL -> WagoProvider` unchanged.

- [ ] **Step 5: Verify GREEN**

```bash
cd server
pnpm jest wago-webhook.controller.spec.ts notification-module-boundaries.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/notifications/reminders
git commit -m "feat: expose signed Wago delivery webhook endpoint"
```

---

### Task 8: Deployment Config, Integration Coverage, Documentation

**Files:**
- Modify: `.env.example`
- Modify: `server/.env.test`
- Modify: `compose.yml`
- Modify: `README.md`
- Modify/create database-backed integration coverage under `server/test/integration/`

- [ ] **Step 1: Document optional webhook secret**

Use:

```env
WAGO_BASE_URL=
WAGO_API_KEY=
WAGO_WEBHOOK_SECRET=
```

Document Wago dashboard callback URL:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

Document that `message.server_accepted` means WhatsApp server acknowledgement only, not device delivery/read.

- [ ] **Step 2: Add critical-path DB integration test**

Scenario:
1. create current actionable reminder;
2. create pending delivery with message ID;
3. persist/process `MESSAGE_REJECTED` callback;
4. assert delivery becomes `REJECTED`;
5. assert later `nextSendAt` shortens to exactly +5 minutes;
6. submit same `Webhook-Id` again and assert no second schedule mutation;
7. create newer delivery then process old delivery callback and assert old callback cannot shorten schedule;
8. delete active reminder and verify delivery history survives FK `SET NULL`.

- [ ] **Step 3: Run integration suite**

```bash
cd server
pnpm test:integration:docker
```

- [ ] **Step 4: Run full server verification**

```bash
cd server
pnpm prisma validate
pnpm prisma generate
pnpm typecheck
pnpm lint
pnpm test -- --runInBand
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add .env.example server/.env.test compose.yml README.md server/test
git commit -m "docs: document Wago delivery webhook integration"
```

---

### Task 9: Exact-head Verification and Integration

- [ ] **Step 1: Static scope sweep**

```bash
git grep -n 'wagoMessageId' -- server/src || true
git diff main...HEAD --check
```

Expected: no Wago-specific message-ID name in business code and no whitespace errors.

- [ ] **Step 2: Open one PR from `feat/wago-delivery-webhook` to `main`**

PR summary must state DB migration, transport receipt change, raw-body HMAC security, durable inbox, first-terminal-state rule, stale/latest guard, and five-minute generic rejection policy.

- [ ] **Step 3: Review exact diff against spec**

Explicitly verify:
- raw bytes authenticated before body trust;
- DB-backed webhook dedup;
- no network request inside DB transaction;
- no direct worker invocation;
- first terminal state wins;
- latest-attempt and eligibility guards;
- shortening uses `nextSendAt > candidate`, so webhook can never delay an earlier retry;
- no invented original message ID on duplicate send;
- logs never expose secret/signature/full callback body.

- [ ] **Step 4: Wait for exact-head required CI**

Fix only demonstrated failures on this same branch. Do not merge while required checks are pending or failing.

- [ ] **Step 5: Squash merge and verify resulting `main` commit**

After required checks pass, squash merge, verify checks on the new main SHA, and delete `feat/wago-delivery-webhook` if the available GitHub connector exposes branch deletion.
