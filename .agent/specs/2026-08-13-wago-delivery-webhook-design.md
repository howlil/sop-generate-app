# Wago Delivery Webhook Integration Design

Date: 2026-08-13
Status: Approved and implementation-aligned
Target branch: `feat/wago-delivery-webhook`
Base branch: `main`

## Context

SOPFlow already sends WhatsApp reminders through Wago using `POST /messages/send`, bearer authentication, normalized Indonesian mobile numbers, and a stable `Idempotency-Key`. Wago can accept a send synchronously and later report the transport outcome asynchronously through signed webhooks.

This integration adds the inbound delivery-feedback path without turning the webhook receiver into a second sender. The existing reminder scheduler remains the only component that executes outbound sends.

Supported Wago callback events for this task:

- `message.server_accepted`;
- `message.rejected`.

`message.server_accepted` is transport/server acknowledgement only. SOPFlow does not claim device delivery or read status.

## Goals

- Persist one logical delivery occurrence for every successfully submitted reminder occurrence.
- Preserve Wago `messageId` behind the provider-agnostic name `transportMessageId`.
- Authenticate callbacks against the exact raw HTTP JSON body.
- Deduplicate callbacks durably using `Webhook-Id`.
- Keep reminder business state separate from transport delivery history.
- Track transport state as `PENDING`, `ACCEPTED`, or `REJECTED`.
- Accelerate a reminder by five minutes only for the latest still-eligible occurrence rejected with `MESSAGE_REJECTED`.
- Never accelerate `REACHOUT_RESTRICTED`, unknown, or empty rejection codes.
- Keep stale/obsolete callbacks as history without reviving old workflow state.
- Handle callback-before-receipt races durably and idempotently.
- Keep the implementation pragmatic: no Redis, Kafka, event bus, extra queue, polling loop, or frontend webhook handling.

## Non-goals

- No inbound WhatsApp chat handling.
- No delivery/read receipt UI.
- No Wago recipient allow/opt-out management from SOPFlow.
- No direct webhook call to `PushReminderWorkerService.processDue()`.
- No redesign of reminder eligibility rules.
- No change to synchronous Wago error retry rules already owned by the outbound provider/worker.
- No change to Wago's API contract.

## State Boundaries

### Active reminder state

`PengingatWhatsApp` remains lifecycle/business state. It answers whether a reminder should currently exist, who receives it, and when it is next due. It is intentionally deletable when workflow state is no longer actionable.

### Delivery history

`PengirimanNotifikasiWhatsApp` stores one immutable logical transport occurrence.

Fields:

- `pengirimanNotifikasiWhatsAppId` UUID primary key;
- `pengingatWhatsAppId` as an immutable snapshot ID, not a foreign key;
- `pengajuanEvaluasiId` snapshot;
- `penggunaId` snapshot;
- `jenis` snapshot;
- unique `idempotencyKey`;
- unique nullable `transportMessageId`;
- `status = PENDING | ACCEPTED | REJECTED`;
- nullable bounded `errorCode`;
- `submittedAt`;
- nullable `resolvedAt`;
- `createdAt`, `updatedAt`.

The reminder ID is deliberately not an FK. Historical correlation must remain intact after `PengingatWhatsApp` is deleted.

### Durable webhook inbox

`WagoWebhookEvent` stores the authenticated callback before business processing.

Fields:

- `webhookId` primary key from `Webhook-Id`;
- `transportMessageId`;
- `event`;
- `status`;
- nullable bounded `errorCode`;
- `sourceCreatedAt`;
- `receivedAt`;
- nullable `processedAt`;
- `createdAt`.

`processedAt = null` means the callback has been durably received but still needs correlation/application. Re-delivery of the same webhook never creates a second row.

## Notification Channel Contract

The notification boundary returns a transport receipt rather than `void`:

```ts
export type NotificationSendReceipt = Readonly<{
  transportMessageId: string | null;
  status: 'pending';
}>;
```

Business code uses `transportMessageId`, never `wagoMessageId`.

For Wago `202`, return the response `messageId` when usable. If Wago accepts the request without a usable ID, return `transportMessageId: null` and do not invent correlation.

## Race-safe Send Flow

For one claimed reminder occurrence:

1. Re-check current reminder eligibility.
2. Build the message and stable idempotency key.
3. Call Wago through `NotificationChannel.send()`.
4. Receive the transport receipt.
5. Persist/reuse `PengirimanNotifikasiWhatsApp` by the same idempotency key.
6. Commit the normal successful reminder schedule using existing `markSuccess`.
7. Only after that schedule commit succeeds, reconcile any durable unmatched webhook for the persisted `transportMessageId`.
8. If reconciliation itself fails, keep it best-effort: do not reinterpret the already accepted outbound send as a transport send failure. Durable inbox state remains available for replay/recovery.

The order in steps 5-7 is a correctness invariant. Reconciliation must not happen before `markSuccess`: a very fast `MESSAGE_REJECTED` callback could otherwise try to shorten an already-due `nextSendAt`, do nothing, become processed, and then be overwritten by the normal success schedule.

If `markSuccess` cannot commit the owned reminder row, do not reconcile from that worker occurrence. This prevents an unmatched callback from being consumed against an uncommitted schedule.

No Wago network call runs inside a database transaction.

## Duplicate-message behavior

Wago `409 DUPLICATE_MESSAGE` is treated as logical submission success. Wago currently does not return the original `messageId` in that response.

Rules:

- reuse the existing delivery row for the same idempotency key;
- never create a second logical occurrence for the same key;
- never fabricate a transport ID.

There is one unavoidable gap in the current Wago contract: if Wago returned `202` and SOPFlow crashed before persisting the returned `messageId`, a later duplicate response cannot recover that ID. SOPFlow degrades safely by leaving callbacks unmatched and never guessing correlation.

## Webhook Endpoint

```text
POST /api/v1/webhooks/wago
```

The endpoint does not use SOPFlow user JWT/cookies. Wago HMAC is the authentication mechanism.

Controller responsibilities:

- require the Wago headers and exact raw body;
- authenticate the signature before trusting body fields;
- validate the supported envelope;
- require header/body webhook ID and event consistency;
- delegate durable processing to `WagoWebhookService`;
- acknowledge only outcomes that are already durably safe;
- never send reminders directly.

## Raw-body and Signature Contract

Signing material:

```text
<Webhook-Id>.<Webhook-Timestamp>.<exact-raw-json-body>
```

Required headers:

- `Webhook-Id`;
- `Webhook-Timestamp`;
- `Webhook-Signature`;
- `X-Wago-Event`.

Verification:

1. Require all headers and the retained raw body.
2. Parse timestamp as Unix seconds.
3. Require timestamp within ±5 minutes of server time.
4. Build signing material from the original header values and exact raw body.
5. Parse one or more space-separated `v1,<base64>` signatures.
6. Compute HMAC-SHA256 with `WAGO_WEBHOOK_SECRET`.
7. Decode candidates and compare with `timingSafeEqual` only for equal byte lengths.
8. Reject if none match.
9. Validate and trust the JSON envelope only after signature success.

Never log API keys, signing secrets, signatures, signing material, or the full webhook body.

## Configuration

Outbound remains:

```env
WAGO_BASE_URL=...
WAGO_API_KEY=...
```

Inbound adds only:

```env
WAGO_WEBHOOK_SECRET=<high-entropy-secret-at-least-32-characters>
```

The webhook receiver and outbound credentials are independently configurable:

- secret present -> signed receiver enabled;
- secret absent -> webhook endpoint reports unavailable/configuration failure;
- outbound sending still requires the existing URL + API-key pair.

Stable constants remain in code:

- signature tolerance: 5 minutes;
- generic rejection acceleration: 5 minutes.

Configure Wago's callback URL as:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

The signing secret configured in Wago and SOPFlow must match.

## Supported Envelope

Only schema version `1` is accepted.

Supported combinations:

- `message.server_accepted` with `data.status = accepted`;
- `message.rejected` with `data.status = rejected` and optional `data.error`.

Required body fields:

- `version`;
- `id`;
- `event`;
- `createdAt`;
- `data.messageId`;
- `data.status`.

Invariants:

- body `id === Webhook-Id`;
- body `event === X-Wago-Event`;
- unsupported version/event/status combinations return a client error.

## Inbox, Deduplication, and Recovery

For a newly authenticated callback:

1. Insert `WagoWebhookEvent` using `Webhook-Id` as the durable idempotency key.
2. Look up a delivery by `transportMessageId`.
3. If the delivery does not exist yet, return `2xx` with `processedAt = null`; the callback is safely retained.
4. If correlated, apply the terminal transition/policy and mark the inbox row processed last.

For a duplicate webhook ID:

- if the persisted inbox row is already processed, return `2xx` no-op;
- if it is still unprocessed, use the persisted inbox row to attempt reconciliation again;
- do not trust a duplicate request body as new state.

When a delivery receipt is later persisted, explicit post-schedule reconciliation queries unprocessed inbox rows for that exact transport ID. This is bounded reconciliation, not polling.

Operations intentionally use durable idempotent steps rather than one large cross-table transaction. The recovery invariant is that `processedAt` is written only after the delivery/no-op/schedule work for that inbox event has completed. If the process crashes earlier, replay can safely retry the remaining work.

## Delivery State Machine

Allowed terminal transitions:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
```

Terminal state never oscillates. Contradictory later callbacks are recorded/processed as history-only no-ops and cannot reverse the first terminal outcome.

## Retry Policy

### `message.server_accepted`

- transition matching `PENDING` delivery to `ACCEPTED`;
- set `resolvedAt`;
- do not change reminder schedule.

### `message.rejected` + `MESSAGE_REJECTED`

- transition matching `PENDING` delivery to `REJECTED`;
- persist bounded error code and `resolvedAt`;
- only the latest delivery for the same business identity may affect scheduling;
- the current active reminder must still exist, match the historical reminder snapshot, and pass `isReminderStillEligible`;
- then shorten schedule atomically to:

```text
min(existingNextSendAt, webhookReceivedAt + 5 minutes)
```

This may accelerate but never delay an earlier retry.

### `REACHOUT_RESTRICTED`

Persist `REJECTED`; do not accelerate. Wago already applies reach-out cooldown protection.

### Unknown or empty rejection code

Persist `REJECTED`; do not accelerate. Unknown gateway behavior must not create aggressive retries.

## Stale and Obsolete Callbacks

A callback for an older attempt may update that attempt's history but must not alter the current schedule when a newer occurrence exists.

If the active reminder was deleted or workflow/role/OPD eligibility changed:

- preserve correlated delivery history;
- do not recreate the reminder;
- do not mutate scheduling.

## Module Boundaries

```text
notifications/reminders/
├── deliveries/
│   ├── notification-delivery.repository.ts
│   ├── notification-delivery.service.ts
│   └── notification-delivery.types.ts
├── webhooks/
│   ├── wago-webhook.controller.ts
│   ├── wago-webhook.repository.ts
│   ├── wago-webhook.service.ts
│   ├── wago-webhook-signature.service.ts
│   └── wago-webhook.types.ts
└── providers/
    └── wago.provider.ts
```

Responsibilities:

- `WagoProvider`: outbound Wago adapter only;
- delivery repository/service: durable occurrence persistence and explicit post-commit reconciliation entry point;
- signature service: timestamp/HMAC verification;
- webhook repository: durable inbox/dedup;
- webhook service: terminal processing, recovery, latest-attempt and eligibility guards;
- controller: HTTP mapping only;
- reminder worker: orchestration order and the only sender execution path.

## HTTP Semantics

- valid event processed: `2xx`;
- valid event durably stored unmatched: `2xx`;
- duplicate already processed: `2xx`;
- duplicate unprocessed: attempt persisted-row recovery, then `2xx` when durable outcome is safe;
- malformed envelope/header inputs: client error;
- invalid/stale signature: authentication/client error according to existing project convention;
- webhook secret absent: `503`;
- DB failure before durable first insert: `5xx` so Wago retries.

Never acknowledge a previously unseen valid callback that failed before durable inbox persistence.

## Database Constraints

`PengirimanNotifikasiWhatsApp`:

- unique `idempotencyKey`;
- unique nullable `transportMessageId`;
- identity/submission index for latest-attempt lookup;
- reminder-snapshot/submission index;
- no FK to the ephemeral reminder row.

`WagoWebhookEvent`:

- primary key `webhookId`;
- index on `(transportMessageId, processedAt)`.

## Testing Contract

Required regression coverage includes:

- provider returns real `transportMessageId` for Wago `202`;
- duplicate success never invents a transport ID;
- raw-body signature acceptance/rejection, multiple signatures, malformed signatures, and ±5 minute window;
- durable webhook-ID dedup;
- accepted terminal transition;
- generic rejection +5 minute acceleration;
- `REACHOUT_RESTRICTED`/unknown/empty no acceleration;
- stale and obsolete reminder no scheduling mutation;
- contradictory terminal callback cannot oscillate state;
- callback-before-delivery persists unmatched then reconciles;
- duplicate unprocessed callback can recover after a crash;
- delivery history survives active reminder deletion;
- receipt persistence occurs before `markSuccess`, while webhook reconciliation occurs only after successful schedule commit;
- DB integration exercises real migrations and race-sensitive scheduling semantics;
- existing critical business E2E and container build remain green.

## Deployment

1. Deploy the database migration and SOPFlow backend.
2. Set `WAGO_WEBHOOK_SECRET` in SOPFlow.
3. In Wago Settings -> Webhook Integration, set callback URL to `https://<sopflow-host>/api/v1/webhooks/wago`.
4. Configure the same signing secret in Wago and SOPFlow.
5. Enable Wago webhook delivery.
6. Perform a controlled reminder send and verify delivery history transitions from `PENDING` to `ACCEPTED` or `REJECTED`.

If Wago webhook delivery is unavailable, the existing normal SOPFlow reminder scheduler remains operational. If SOPFlow is temporarily unavailable, Wago's durable delivery mechanism can retry callbacks.

## Acceptance Criteria

Complete when:

- one durable delivery row represents one logical reminder occurrence;
- transport IDs are retained only when supplied by Wago;
- callback authentication uses exact raw body and five-minute replay tolerance;
- webhook IDs are durably idempotent;
- callback-before-receipt races are safely retained and reconciled after the normal schedule commit;
- accepted callbacks update transport history only;
- latest/current/eligible `MESSAGE_REJECTED` callbacks accelerate retry by five minutes without delaying earlier retries;
- `REACHOUT_RESTRICTED`, unknown, empty, stale, and obsolete callbacks do not accelerate;
- terminal delivery states cannot oscillate;
- no fake correlation is created for Wago duplicate responses;
- no Wago network call is held inside a DB transaction;
- deployment docs describe callback URL and signing-secret setup;
- server quality, DB integration, critical E2E, client quality, and container build all pass.
