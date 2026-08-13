# Wago Delivery Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add durable, signed Wago delivery-webhook ingestion to SOPFlow so every outbound WhatsApp reminder attempt can be correlated to `message.server_accepted` / `message.rejected`, with safe five-minute retry acceleration only for the latest still-actionable `MESSAGE_REJECTED` attempt.

**Architecture:** Keep `PengingatWhatsApp` as active business reminder state, add a durable delivery-attempt history keyed by transport message ID/idempotency key, and add a durable webhook inbox keyed by `Webhook-Id`. `WagoProvider` returns a provider-agnostic transport receipt; the webhook boundary verifies raw-body HMAC before envelope validation; the application service resolves terminal attempt state and narrowly updates `nextSendAt` without ever calling the worker directly.

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7 + MariaDB/MySQL, Jest 30, Zod, Node `crypto` HMAC/timing-safe comparison, existing `@nestjs/schedule` reminder scheduler.

## Global Constraints

- Work only on branch `feat/wago-delivery-webhook`; one task branch only.
- Use TDD: write/commit RED tests before each production behavior where practical, then GREEN implementation.
- Keep `NotificationChannel` provider-agnostic; business code uses `transportMessageId`, never `wagoMessageId`.
- `PengingatWhatsApp` remains active lifecycle state and must not become delivery history.
- Wago webhook schema version supported: exactly `1`.
- Supported events: `message.server_accepted` and `message.rejected` only.
- HMAC signing material: `<Webhook-Id>.<Webhook-Timestamp>.<exact raw JSON body>`.
- Signature algorithm: HMAC-SHA256, Base64 signature payload, constant-time comparison.
- Signature timestamp tolerance: ±5 minutes.
- `MESSAGE_REJECTED`: accelerate only the latest relevant active reminder attempt to `min(existingNextSendAt, now + 5 minutes)`.
- `REACHOUT_RESTRICTED`: record rejection; do not accelerate.
- Unknown/empty rejection code: record rejection; do not accelerate.
- Duplicate `Webhook-Id`: `2xx` no-op.
- Stale attempt callback: update delivery history only; never modify reminder scheduling.
- Obsolete/non-actionable reminder: update delivery history only; never recreate reminder state.
- Do not call `PushReminderWorkerService.processDue()` from webhook code.
- No Redis, Kafka, new queue, webhook polling, frontend webhook UI, inbound WhatsApp support, or recipient auto-allow.
- Never hold a DB transaction open across a Wago HTTP request.
- Webhook receiver remains optional: outbound Wago sending works without `WAGO_WEBHOOK_SECRET`; unsigned callbacks are never accepted.
- Wago `DUPLICATE_MESSAGE` does not expose the original `messageId`; never invent correlation after a crash window that lost the original receipt.

---

## File Structure

Create or modify these focused units:

```text
server/prisma/schema.prisma
server/prisma/migrations/20260813xxxxxx_add_wago_delivery_webhook_state/migration.sql

server/src/modules/notifications/reminders/
├── deliveries/
│   ├── notification-delivery.repository.ts
│   ├── notification-delivery.repository.spec.ts
│   ├── notification-delivery.service.ts
│   ├── notification-delivery.service.spec.ts
│   └── notification-delivery.types.ts
├── webhooks/
│   ├── wago-webhook.controller.ts
│   ├── wago-webhook.controller.spec.ts
│   ├── wago-webhook.repository.ts
│   ├── wago-webhook.repository.spec.ts
│   ├── wago-webhook.service.ts
│   ├── wago-webhook.service.spec.ts
│   ├── wago-webhook-signature.service.ts
│   ├── wago-webhook-signature.service.spec.ts
│   └── wago-webhook.types.ts
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

.env.example
server/.env.test
compose.yml
README.md
.agent/specs/2026-08-13-wago-delivery-webhook-design.md
```

If the existing Prisma/client generation requires duplicated notification models in `server/prisma/notifications.prisma`, update that file consistently instead of leaving divergent schemas.

---

### Task 1: Persist Delivery Attempts and Webhook Inbox

**Files:**
- Modify: `server/prisma/schema.prisma`
- Modify when required by current project convention: `server/prisma/notifications.prisma`
- Create: `server/prisma/migrations/20260813xxxxxx_add_wago_delivery_webhook_state/migration.sql`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.types.ts`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.ts`
- Create: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.spec.ts`
- Modify: `server/test/integration/helpers/integration-database.util.ts` if it explicitly clears notification tables.

**Interfaces:**
- Produces `NotificationDeliveryRepository.createOrGetPending(...)`, `findByTransportMessageId(...)`, `findLatestForReminderIdentity(...)`, and terminal transition helpers.
- Produces durable models `PengirimanNotifikasiWhatsApp` and `WagoWebhookEvent` for later tasks.

- [ ] **Step 1: Write RED repository tests for delivery-attempt identity and lifecycle**

Add tests equivalent to:

```ts
it('creates one pending delivery per idempotency key', async () => {
  const first = await repository.createOrGetPending({
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'submission-1',
    penggunaId: 'user-1',
    kind: JenisPengingatWhatsApp.EVALUASI_SOP,
    idempotencyKey: 'sopflow-reminder:reminder-1:initial',
    transportMessageId: 'wamid-1',
    submittedAt: new Date('2026-08-13T08:00:00.000Z'),
  });
  const duplicate = await repository.createOrGetPending({
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'submission-1',
    penggunaId: 'user-1',
    kind: JenisPengingatWhatsApp.EVALUASI_SOP,
    idempotencyKey: 'sopflow-reminder:reminder-1:initial',
    transportMessageId: 'wamid-1',
    submittedAt: new Date('2026-08-13T08:01:00.000Z'),
  });

  expect(duplicate.pengirimanNotifikasiWhatsAppId).toBe(first.pengirimanNotifikasiWhatsAppId);
});

it('keeps historical delivery when active reminder is deleted', async () => {
  const delivery = await repository.createOrGetPending(/* fixture */);
  await prisma.pengingatWhatsApp.delete({ where: { pengingatWhatsAppId: 'reminder-1' } });

  const persisted = await prisma.pengirimanNotifikasiWhatsApp.findUnique({
    where: { pengirimanNotifikasiWhatsAppId: delivery.pengirimanNotifikasiWhatsAppId },
  });
  expect(persisted?.pengingatWhatsAppId).toBeNull();
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
cd server
pnpm jest notification-delivery.repository.spec.ts --runInBand
```

Expected: fail because delivery models/repository do not exist.

- [ ] **Step 3: Add schema and migration**

Use explicit Prisma enums/models equivalent to:

```prisma
enum StatusPengirimanNotifikasiWhatsApp {
  PENDING
  ACCEPTED
  REJECTED
}

model PengirimanNotifikasiWhatsApp {
  pengirimanNotifikasiWhatsAppId String                           @id @default(uuid()) @db.Char(36)
  pengingatWhatsAppId            String?                          @db.Char(36)
  pengajuanEvaluasiId            String                           @db.Char(36)
  penggunaId                     String                           @db.Char(36)
  jenis                          JenisPengingatWhatsApp
  idempotencyKey                 String                           @unique @db.VarChar(191)
  transportMessageId             String?                          @unique @db.VarChar(191)
  status                         StatusPengirimanNotifikasiWhatsApp @default(PENDING)
  errorCode                      String?                          @db.VarChar(64)
  submittedAt                    DateTime                         @db.DateTime(3)
  resolvedAt                     DateTime?                        @db.DateTime(3)
  createdAt                      DateTime                         @default(now()) @db.DateTime(3)
  updatedAt                      DateTime                         @updatedAt @db.DateTime(3)
  pengingatWhatsApp              PengingatWhatsApp?               @relation(fields: [pengingatWhatsAppId], references: [pengingatWhatsAppId], onDelete: SetNull)

  @@index([pengajuanEvaluasiId, penggunaId, jenis, submittedAt], map: "PengirimanNotifikasi_identity_submitted_idx")
  @@index([pengingatWhatsAppId, submittedAt], map: "PengirimanNotifikasi_reminder_submitted_idx")
}

model WagoWebhookEvent {
  webhookId          String   @id @db.VarChar(191)
  transportMessageId String   @db.VarChar(191)
  event              String   @db.VarChar(64)
  status             String   @db.VarChar(16)
  errorCode          String?  @db.VarChar(64)
  sourceCreatedAt    DateTime @db.DateTime(3)
  receivedAt         DateTime @db.DateTime(3)
  processedAt        DateTime? @db.DateTime(3)
  createdAt          DateTime @default(now()) @db.DateTime(3)

  @@index([transportMessageId, processedAt], map: "WagoWebhook_message_processed_idx")
}
```

Add the inverse `pengirimanNotifikasi` relation on `PengingatWhatsApp`.

Migration must create the enum/table definitions using the repository's existing MariaDB-compatible Prisma migration style, unique constraints, indexes, and `ON DELETE SET NULL` foreign key.

- [ ] **Step 4: Implement the focused repository**

Define a provider-neutral type:

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

`createOrGetPending` must first query by `idempotencyKey`; create only if absent. Do not create a second row for the same logical occurrence.

- [ ] **Step 5: Run repository tests GREEN and validate Prisma**

Run:

```bash
cd server
pnpm prisma validate
pnpm prisma generate
pnpm jest notification-delivery.repository.spec.ts --runInBand
```

Expected: all pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add server/prisma server/src/modules/notifications/reminders/deliveries server/test/integration/helpers/integration-database.util.ts
git commit -m "feat: persist notification delivery attempts"
```

---

### Task 2: Return Transport Receipts from the Wago Provider

**Files:**
- Modify: `server/src/modules/notifications/reminders/providers/notification-channel.interface.ts`
- Modify: `server/src/modules/notifications/reminders/providers/wago.provider.ts`
- Modify: `server/src/modules/notifications/reminders/providers/wago.provider.spec.ts`

**Interfaces:**
- Produces:

```ts
export type NotificationSendReceipt = Readonly<{
  transportMessageId: string | null;
  status: 'pending';
}>;
```

- `NotificationChannel.send(...)` returns `Promise<NotificationSendReceipt>`.

- [ ] **Step 1: Write RED Wago provider receipt tests**

Change the successful-send test to assert:

```ts
await expect(
  provider.send('085373945490', 'Pesan uji', {
    idempotencyKey: 'sopflow-reminder:r1:initial',
  }),
).resolves.toEqual({ transportMessageId: 'm1', status: 'pending' });
```

Add a successful `202` test with missing/null `messageId` that returns:

```ts
{ transportMessageId: null, status: 'pending' }
```

Keep `DUPLICATE_MESSAGE` as logical success but return a receipt with `transportMessageId: null`; do not invent the original ID.

- [ ] **Step 2: Run provider test RED**

```bash
cd server
pnpm jest wago.provider.spec.ts --runInBand
```

Expected: current provider resolves `undefined`.

- [ ] **Step 3: Implement receipt parsing**

Parse only the successful response fields needed:

```ts
type WagoSuccessBody = Readonly<{
  messageId?: unknown;
  status?: unknown;
}>;
```

Return a normalized receipt on `2xx`, and keep all current error mappings unchanged.

- [ ] **Step 4: Run provider tests GREEN**

```bash
cd server
pnpm jest wago.provider.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 5: Commit Task 2**

```bash
git add server/src/modules/notifications/reminders/providers
git commit -m "refactor: return transport receipts from notification channels"
```

---

### Task 3: Persist the Receipt in the Reminder Worker

**Files:**
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts`
- Create/modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.ts`
- Create/modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/notification.module.ts`

**Interfaces:**
- Consumes `NotificationSendReceipt` and `NotificationDeliveryRepository.createOrGetPending`.
- Produces `NotificationDeliveryService.recordSubmission(reminder, idempotencyKey, receipt, submittedAt)` for the worker and later webhook reconciliation.

- [ ] **Step 1: Write RED worker tests**

Cover:

```ts
expect(channel.send).toHaveBeenCalledWith(destination, body, {
  idempotencyKey: 'sopflow-reminder:r1:initial',
});
expect(deliveryService.recordSubmission).toHaveBeenCalledWith(
  expect.objectContaining({ notificationReminderId: 'r1' }),
  'sopflow-reminder:r1:initial',
  { transportMessageId: 'wamid-1', status: 'pending' },
  expect.any(Date),
);
```

Also assert that `markSuccess` happens after `recordSubmission` resolves, and that duplicate logical success does not create a second delivery occurrence.

- [ ] **Step 2: Run worker tests RED**

```bash
cd server
pnpm jest push-reminder-worker.service.spec.ts notification-delivery.service.spec.ts --runInBand
```

- [ ] **Step 3: Implement `NotificationDeliveryService.recordSubmission`**

The service should:

```ts
async recordSubmission(
  reminder: ClaimedNotificationReminder,
  idempotencyKey: string,
  receipt: NotificationSendReceipt,
  submittedAt: Date,
): Promise<NotificationDeliveryRecord>
```

It must persist snapshot identity + receipt and then reconcile any already-stored unmatched webhook events for `transportMessageId` when non-null.

Initially inject a reconciliation collaborator/interface that can be implemented in Task 6; avoid a circular module import. A small callback/service boundary is acceptable, but do not create a generic event bus.

- [ ] **Step 4: Update the worker**

Replace:

```ts
await this.channel.send(...);
```

with:

```ts
const idempotencyKey = this.buildIdempotencyKey(reminder);
const receipt = await this.channel.send(reminder.destination, message.body, { idempotencyKey });
const sentAt = new Date();
await this.deliveryService.recordSubmission(reminder, idempotencyKey, receipt, sentAt);
await this.repository.markSuccess(...);
```

Do not alter existing transient/configuration failure backoff behavior.

- [ ] **Step 5: Run tests GREEN**

```bash
cd server
pnpm jest push-reminder-worker.service.spec.ts notification-delivery.service.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 6: Commit Task 3**

```bash
git add server/src/modules/notifications/reminders
git commit -m "feat: record Wago reminder delivery attempts"
```

---

### Task 4: Retain Raw JSON Body and Verify Wago Signatures

**Files:**
- Create: `server/src/common/http/raw-body.ts`
- Modify: `server/src/main.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook-signature.service.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook-signature.service.spec.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.types.ts`
- Modify: `server/src/config/env.validation.ts`
- Modify: `server/src/config/env.validation.spec.ts`

**Interfaces:**
- Produces a typed raw-body accessor for the controller.
- Produces `WagoWebhookSignatureService.verify(input): void` with deterministic clock injection/test seam if needed.

- [ ] **Step 1: Write RED signature tests**

Cover valid signature, tampered body, multiple rotation signatures, malformed Base64/signature entries, missing configured secret, and timestamp beyond ±300 seconds.

Example signing fixture:

```ts
const body = '{"version":"1","id":"delivery-1","event":"message.server_accepted","createdAt":"2026-08-13T08:00:00.000Z","data":{"messageId":"wamid-1","status":"accepted"}}';
const timestamp = '1786608000';
const signature = createHmac('sha256', secret)
  .update(`delivery-1.${timestamp}.${body}`)
  .digest('base64');

expect(() =>
  service.verify({
    webhookId: 'delivery-1',
    timestamp,
    signatureHeader: `v1,${signature}`,
    rawBody: Buffer.from(body),
    now: new Date(Number(timestamp) * 1000),
  }),
).not.toThrow();
```

- [ ] **Step 2: Write RED env tests**

Add cases proving:
- empty `WAGO_WEBHOOK_SECRET` is accepted and treated as disabled receiver configuration;
- high-entropy secret (minimum 32 characters) is accepted;
- short non-empty secret is rejected;
- Wago outbound pair remains independently optional.

- [ ] **Step 3: Run RED tests**

```bash
cd server
pnpm jest wago-webhook-signature.service.spec.ts env.validation.spec.ts --runInBand
```

- [ ] **Step 4: Implement raw-body capture without a second JSON parser**

Use the existing explicit parser hook:

```ts
export type RequestWithRawBody = Request & { rawBody?: Buffer };

app.useBodyParser('json', {
  limit: JSON_BODY_LIMIT,
  verify: (req, _res, buffer) => {
    (req as RequestWithRawBody).rawBody = Buffer.from(buffer);
  },
});
```

Keep urlencoded parsing unchanged.

- [ ] **Step 5: Implement signature verification**

Rules:
- configured secret required to accept requests;
- parse Unix seconds strictly;
- `Math.abs(nowSeconds - timestampSeconds) <= 300`;
- parse all space-separated `v1,<base64>` candidates;
- calculate `createHmac('sha256', secret).update(material).digest()`;
- Base64-decode candidate and call `timingSafeEqual` only for equal byte lengths;
- do not log secrets/body/signatures.

- [ ] **Step 6: Run tests GREEN**

```bash
cd server
pnpm jest wago-webhook-signature.service.spec.ts env.validation.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 7: Commit Task 4**

```bash
git add server/src/common/http/raw-body.ts server/src/main.ts server/src/config server/src/modules/notifications/reminders/webhooks/wago-webhook-signature.service* server/src/modules/notifications/reminders/webhooks/wago-webhook.types.ts
git commit -m "feat: verify signed Wago webhook requests"
```

---

### Task 5: Implement Durable Webhook Inbox and Deduplication

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.repository.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.repository.spec.ts`

**Interfaces:**
- Produces `insertIfNew(event, receivedAt): Promise<'inserted' | 'duplicate'>`.
- Produces `findUnprocessedByTransportMessageId(messageId)` and `markProcessed(webhookId, processedAt)`.

- [ ] **Step 1: Write RED inbox tests**

Cover:
- first insert persists exact sanitized event fields;
- second insert with same `webhookId` returns duplicate without overwriting first row;
- unmatched callback remains with `processedAt = null`;
- query by `transportMessageId` returns only unprocessed events in source/received deterministic order.

- [ ] **Step 2: Run RED tests**

```bash
cd server
pnpm jest wago-webhook.repository.spec.ts --runInBand
```

- [ ] **Step 3: Implement repository using database uniqueness for idempotency**

Do not implement dedup using an in-memory Set. Prefer a create/createMany `skipDuplicates` or unique-violation-safe insert consistent with Prisma/MariaDB behavior.

- [ ] **Step 4: Run GREEN tests**

```bash
cd server
pnpm jest wago-webhook.repository.spec.ts --runInBand
```

- [ ] **Step 5: Commit Task 5**

```bash
git add server/src/modules/notifications/reminders/webhooks/wago-webhook.repository*
git commit -m "feat: persist and deduplicate Wago webhook events"
```

---

### Task 6: Resolve Webhook Events and Apply Safe Retry Acceleration

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.service.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.repository.ts`
- Modify: `server/src/modules/notifications/reminders/deliveries/notification-delivery.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.repository.ts`
- Modify/add focused tests for touched repositories/services.

**Interfaces:**
- Produces `WagoWebhookService.ingest(trustedEvent, receivedAt)`.
- Produces `WagoWebhookService.reconcileTransportMessage(messageId)` for post-send race reconciliation.
- Adds a repository method to accelerate an existing active reminder only when the currently persisted `nextSendAt` is later than the target.

- [ ] **Step 1: Write RED service tests for all scheduling branches**

Required cases:

```ts
it('accelerates latest eligible MESSAGE_REJECTED attempt by five minutes', async () => {
  await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);
  expect(reminderRepository.accelerateNextSendAt).toHaveBeenCalledWith(
    'reminder-1',
    new Date(now.getTime() + 5 * 60_000),
  );
});

it.each(['REACHOUT_RESTRICTED', undefined, 'SOMETHING_NEW'])(
  'does not accelerate for %s',
  async (errorCode) => {
    await service.ingest(rejectedEvent(errorCode), now);
    expect(reminderRepository.accelerateNextSendAt).not.toHaveBeenCalled();
  },
);

it('does not accelerate a stale attempt', async () => { /* newer attempt exists */ });
it('does not accelerate when active reminder no longer exists', async () => { /* history only */ });
it('does not accelerate when reminder is no longer eligible', async () => { /* workflow changed */ });
it('does not reapply duplicate webhook id', async () => { /* inbox duplicate */ });
it('stores unmatched event and later reconciles it by transportMessageId', async () => { /* race */ });
it('keeps first terminal state when contradictory callback arrives', async () => { /* accepted then rejected */ });
```

- [ ] **Step 2: Run RED tests**

```bash
cd server
pnpm jest wago-webhook.service.spec.ts notification-delivery.service.spec.ts --runInBand
```

- [ ] **Step 3: Add reminder query/update support without duplicating eligibility rules**

Add a repository method that loads the active reminder in a shape compatible with `ClaimedNotificationReminder` or extract a shared eligibility input type so `isReminderStillEligible` remains the one rule implementation.

Add:

```ts
async accelerateNextSendAt(notificationReminderId: string, candidate: Date): Promise<boolean> {
  const result = await this.prisma.pengingatWhatsApp.updateMany({
    where: {
      pengingatWhatsAppId: notificationReminderId,
      nextSendAt: { gt: candidate },
    },
    data: { nextSendAt: candidate },
  });
  return result.count === 1;
}
```

Do not change lock state or call the worker.

- [ ] **Step 4: Implement terminal-state transition rules**

Delivery repository/service must enforce:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
ACCEPTED -> no-op
REJECTED -> no-op
```

First terminal state wins. A contradictory later event is processed as a no-op anomaly and may be logged without body/secret data.

- [ ] **Step 5: Implement latest-attempt guard**

Compare the matched delivery with the newest persisted delivery for the same reminder identity. Only identical latest attempt may affect scheduling.

When `pengingatWhatsAppId` has become null after lifecycle deletion, find active reminder only by the snapshot natural identity (`pengajuanEvaluasiId`, `penggunaId`, `jenis`) if one currently exists; do not recreate it.

- [ ] **Step 6: Implement race reconciliation**

When `recordSubmission` stores a non-null transport message ID, call:

```ts
await webhookService.reconcileTransportMessage(receipt.transportMessageId);
```

The reconciliation reads only unprocessed inbox events for that message ID. No global polling loop.

- [ ] **Step 7: Run GREEN tests**

```bash
cd server
pnpm jest wago-webhook.service.spec.ts notification-delivery.service.spec.ts push-reminder-worker.service.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 8: Commit Task 6**

```bash
git add server/src/modules/notifications/reminders
git commit -m "feat: reconcile Wago delivery webhooks with reminder retries"
```

---

### Task 7: Add the HTTP Webhook Boundary

**Files:**
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.controller.ts`
- Create: `server/src/modules/notifications/reminders/webhooks/wago-webhook.controller.spec.ts`
- Modify: `server/src/modules/notifications/reminders/notification.module.ts`

**Interfaces:**
- Exposes `POST /api/v1/webhooks/wago`.
- Consumes raw body + signature verifier + `WagoWebhookService`.

- [ ] **Step 1: Write RED controller tests**

Test with Nest testing module/supertest or focused controller invocation according to existing repository patterns:
- valid signed accepted event -> `2xx`;
- valid duplicate -> `2xx`;
- valid signed unmatched event -> `2xx` because it was durably stored;
- missing raw body -> reject;
- missing required header -> reject;
- bad signature -> reject;
- body `id` != `Webhook-Id` -> `400`;
- body `event` != `X-Wago-Event` -> `400`;
- unsupported `version` / event / status pair -> `400`;
- no configured secret -> `503`;
- repository/service failure before durable storage -> `5xx`.

- [ ] **Step 2: Run controller tests RED**

```bash
cd server
pnpm jest wago-webhook.controller.spec.ts --runInBand
```

- [ ] **Step 3: Implement strict envelope validation**

Use a small Zod schema or DTO-local parser only after HMAC verification:

```ts
const envelopeSchema = z.discriminatedUnion('event', [
  z.object({
    version: z.literal('1'),
    id: z.string().min(1),
    event: z.literal('message.server_accepted'),
    createdAt: z.string().datetime(),
    data: z.object({
      messageId: z.string().min(1),
      status: z.literal('accepted'),
    }),
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

Do not trust parsed body before the signature has been verified against raw bytes.

- [ ] **Step 4: Wire providers/controller in `NotificationModule`**

Register only concrete services required; avoid a second module unless Nest circularity requires it. Keep `NOTIFICATION_CHANNEL -> WagoProvider` unchanged.

- [ ] **Step 5: Run controller/module tests GREEN**

```bash
cd server
pnpm jest wago-webhook.controller.spec.ts notification-module-boundaries.spec.ts --runInBand
pnpm typecheck
```

- [ ] **Step 6: Commit Task 7**

```bash
git add server/src/modules/notifications/reminders/webhooks server/src/modules/notifications/reminders/notification.module.ts
git commit -m "feat: expose signed Wago delivery webhook endpoint"
```

---

### Task 8: Configuration, Deployment Documentation, and Integration Coverage

**Files:**
- Modify: `.env.example`
- Modify: `server/.env.test`
- Modify: `compose.yml`
- Modify: `README.md`
- Modify or create focused integration test under `server/test/integration/` if current DB integration harness supports direct webhook HTTP testing.
- Modify: `.agent/specs/2026-08-13-wago-delivery-webhook-design.md` only if implementation discovers a necessary clarified invariant; do not silently diverge.

**Interfaces:**
- Deployment operator configures callback URL in Wago dashboard and copies the same signing secret into `WAGO_WEBHOOK_SECRET` for SOPFlow.

- [ ] **Step 1: Add configuration docs**

`.env.example` Wago section becomes:

```env
# WhatsApp outbound opsional melalui Wago self-hosted.
WAGO_BASE_URL=
WAGO_API_KEY=

# Opsional: aktifkan receiver delivery webhook Wago.
# Gunakan signing secret yang sama dengan Wago Settings -> Webhook Integration.
WAGO_WEBHOOK_SECRET=
```

Document callback URL:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

State explicitly that `message.server_accepted` is server acknowledgement, not device delivery/read.

- [ ] **Step 2: Add integration/persistence test for the critical path**

Minimum database-backed scenario:
1. create actionable reminder fixture;
2. create pending delivery with `transportMessageId`;
3. ingest signed/persisted `MESSAGE_REJECTED` event;
4. assert delivery `REJECTED`;
5. assert `nextSendAt` is advanced to +5 minutes only when it was later;
6. ingest same `Webhook-Id` again;
7. assert schedule did not mutate again;
8. create newer attempt and ingest stale old event;
9. assert no schedule acceleration from the old attempt.

- [ ] **Step 3: Run focused integration tests**

```bash
cd server
pnpm test:integration:docker
```

Expected: existing integration suite plus new webhook persistence case passes.

- [ ] **Step 4: Run repository-wide server verification**

```bash
cd server
pnpm prisma validate
pnpm prisma generate
pnpm typecheck
pnpm lint
pnpm test -- --runInBand
pnpm build
```

Do not weaken tests/coverage to make the change pass.

- [ ] **Step 5: Commit Task 8**

```bash
git add .env.example server/.env.test compose.yml README.md server/test .agent/specs/2026-08-13-wago-delivery-webhook-design.md
git commit -m "docs: document Wago delivery webhook integration"
```

---

### Task 9: Final Verification, PR Review, and Squash Merge

**Files:**
- No new production behavior unless a verification failure proves a defect.

- [ ] **Step 1: Static scope sweep**

Search for accidental coupling/secrets/placeholders:

```bash
git grep -nE 'wagoMessageId|TODO|TBD|Webhook-Signature.*log|WAGO_WEBHOOK_SECRET.*log'
git diff main...HEAD --check
```

Expected: no business-layer `wagoMessageId`, no unresolved placeholders, no secret/signature logging, no whitespace errors.

- [ ] **Step 2: Full exact-head verification**

Run the same mandatory local gates available in the repository and push exact HEAD. Open one PR from `feat/wago-delivery-webhook` to `main`.

- [ ] **Step 3: Review the PR against the design**

Check explicitly:
- raw-body verification before payload trust;
- database-backed dedup;
- no transaction around network calls;
- first terminal state wins;
- latest-attempt guard;
- eligibility guard;
- five-minute acceleration uses `min(existing, candidate)` semantics;
- no direct worker invocation;
- no invented message ID for duplicate sends;
- docs match actual config.

- [ ] **Step 4: Wait for mandatory CI/checks on exact HEAD**

Do not merge while required checks are pending or failing. Fix only demonstrated failures on this same branch.

- [ ] **Step 5: Squash merge and verify `main`**

Use squash merge once all required checks are green, then verify the resulting main commit checks. Delete the task branch if the available GitHub tooling supports it.
