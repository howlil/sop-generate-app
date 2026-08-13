# Wago Delivery Webhook Integration Design

Date: 2026-08-13
Status: Approved design
Target branch: `feat/wago-delivery-webhook`
Base branch: `main`

## Context

SOPFlow already sends WhatsApp reminders through Wago. The existing `WagoProvider` calls `POST /messages/send` with bearer authentication, normalized phone numbers, and an `Idempotency-Key`. The reminder worker currently treats Wago's synchronous HTTP acceptance as transport submission success and schedules the next reminder occurrence.

Wago also exposes durable signed delivery webhooks for outbound message transitions. The supported events are `message.server_accepted` and `message.rejected`. Delivery is at least once, signed with HMAC-SHA256, durably retried by Wago, and may be manually redelivered with the same webhook delivery ID.

This task adds the inbound half of that integration to SOPFlow. It tracks individual transport attempts and lets a narrow class of post-submit rejection accelerate the normal reminder schedule without making the webhook receiver a second reminder executor.

## Goals

- Persist one logical delivery record for each successfully submitted reminder occurrence.
- Retain Wago's `messageId` as provider-agnostic `transportMessageId`.
- Verify callbacks against the exact raw request body before trusting JSON.
- Deduplicate callbacks durably with `Webhook-Id`.
- Track `PENDING`, `ACCEPTED`, and `REJECTED` transport outcomes separately from reminder business state.
- Accelerate the next reminder retry by five minutes only for the latest eligible attempt rejected with `MESSAGE_REJECTED`.
- Do not accelerate for `REACHOUT_RESTRICTED`, unknown, or empty rejection codes.
- Record stale callbacks without allowing them to alter current scheduling.
- Preserve the existing scheduler/worker as the only executor of sends.
- Keep the `NotificationChannel` boundary provider-agnostic.
- Remain pragmatic: no Redis, Kafka, new queue, polling loop, or frontend webhook handling.

## Non-goals

- No claim of device delivery/read status; Wago's accepted event is only server acknowledgement.
- No frontend delivery-history UI in this task.
- No Wago recipient allow/opt-out management from SOPFlow.
- No inbound WhatsApp message handling.
- No generic event bus.
- No webhook-triggered direct call to `PushReminderWorkerService.processDue()`.
- No redesign of reminder eligibility rules.
- No retry acceleration for errors returned synchronously by `POST /messages/send`; existing provider/worker retry rules stay authoritative there.
- No change to Wago's public API contract in this task.

## State Boundaries

### 1. Active reminder state

`PengingatWhatsApp` remains the authoritative active reminder state. It answers whether a reminder should exist, who should receive it, when it is next due, and current failure counters.

It remains lifecycle state, not delivery history.

### 2. Delivery attempt history

Add the final Prisma model `PengirimanNotifikasiWhatsApp`.

Each row represents one logical reminder occurrence that Wago accepted for processing.

Required fields:

- `pengirimanNotifikasiWhatsAppId` UUID primary key;
- nullable `pengingatWhatsAppId` relation to the currently active reminder;
- snapshot identity: `pengajuanEvaluasiId`, `penggunaId`, `jenis`;
- `idempotencyKey` unique;
- nullable unique `transportMessageId`;
- `status`: `PENDING | ACCEPTED | REJECTED`;
- nullable bounded `errorCode`;
- `submittedAt`;
- nullable `resolvedAt`;
- `createdAt`, `updatedAt`.

The reminder relation uses `onDelete: SetNull`. Snapshot identity is intentionally retained because active reminder rows are deleted when workflow state changes, while historical delivery callbacks may still arrive later.

### 3. Durable webhook inbox

Add the final Prisma model `WagoWebhookEvent`.

Required fields:

- `webhookId` primary key from `Webhook-Id`;
- `transportMessageId`;
- `event`;
- `status`;
- nullable `errorCode`;
- `sourceCreatedAt` from the Wago envelope;
- `receivedAt`;
- nullable `processedAt`.

No additional webhook state machine is needed. `processedAt = null` means the event is durably received but not yet correlated/applied. Duplicate webhook IDs do not create a second row.

## Notification Channel Contract

The existing `NotificationChannel.send()` returns `Promise<void>`, which discards the Wago `messageId` required for callback correlation.

Change the boundary to:

```ts
export type NotificationSendReceipt = Readonly<{
  transportMessageId: string | null;
  status: 'pending';
}>;

export interface NotificationChannel {
  send(
    destination: string,
    message: string,
    options?: NotificationSendOptions,
  ): Promise<NotificationSendReceipt>;
}
```

Business logic uses `transportMessageId`, never `wagoMessageId`.

For Wago HTTP `202`, parse the response and return its `messageId`. If Wago returns success without a usable ID, return `transportMessageId: null`; log a warning without message text/secrets and do not invent an identifier.

## Send Flow

For each claimed reminder occurrence:

1. Re-check existing reminder eligibility.
2. Build the reminder message and current stable idempotency key.
3. Call `NotificationChannel.send()`.
4. Receive `NotificationSendReceipt`.
5. Upsert/create `PengirimanNotifikasiWhatsApp` by the same `idempotencyKey`, storing `transportMessageId` and `PENDING`.
6. Reconcile any previously received unmatched webhook with that `transportMessageId`.
7. Mark the reminder occurrence successful using the existing `markSuccess` behavior.

No network call occurs inside a database transaction.

### Duplicate-message behavior

Wago currently returns `409 DUPLICATE_MESSAGE` without returning the original `messageId`. SOPFlow already treats this as logical success.

Preserve that behavior, with these rules:

- never create a second delivery-history row for the same `idempotencyKey`;
- if a row for the idempotency key already exists, reuse it;
- do not fabricate a transport message ID from a duplicate response.

There is one unavoidable correlation gap under Wago's current contract: if Wago accepted a send, then SOPFlow crashed after the `202` response but before persisting the returned `messageId`, a later duplicate response cannot recover that original message ID. In that rare window SOPFlow must fail safely: keep any callback durably unmatched, do not guess which reminder it belongs to, and leave normal reminder scheduling unchanged. Eliminating this gap requires a future Wago contract change that exposes the original message ID or a caller correlation ID on duplicate/webhook responses; that is explicitly out of scope here.

## Webhook Endpoint

Add:

```text
POST /api/v1/webhooks/wago
```

The endpoint does not use user JWT/cookies. Wago HMAC is its authentication mechanism.

Controller responsibilities are limited to:

- obtain required headers and raw JSON body;
- authenticate the signature;
- validate the trusted envelope;
- delegate to `WagoWebhookService`;
- return success for new persisted events and duplicate webhook IDs;
- reject malformed/unauthenticated/unsupported requests;
- never execute reminder sending directly.

## Raw-body Requirement

Wago signs exactly:

```text
<webhook-id>.<webhook-timestamp>.<raw-json-request-body>
```

SOPFlow must verify this exact received body. Re-serializing parsed JSON with `JSON.stringify()` is not equivalent.

The Nest bootstrap already disables default body parsing and installs explicit parsers. Extend the existing JSON parser configuration to retain the raw bytes/string on the request. Do not register a competing JSON parser.

Expose raw body through a small typed HTTP-boundary helper/decorator/request type; application services must not depend on Express internals.

## Signature Verification

Required headers:

- `Webhook-Id`;
- `Webhook-Timestamp`;
- `Webhook-Signature`;
- `X-Wago-Event`.

Verification sequence:

1. Reject missing headers.
2. Parse timestamp as Unix seconds.
3. Require it within ±5 minutes of server time.
4. Build signing material from the header webhook ID, the original timestamp string, and exact raw body.
5. Parse one or more space-separated `v1,<base64>` signatures.
6. Compute HMAC-SHA256 with `WAGO_WEBHOOK_SECRET`.
7. Decode candidates and compare with `timingSafeEqual` only when byte lengths match.
8. Reject if no candidate matches.
9. Only then validate/trust the JSON envelope.

Never log the secret, signature values, signing material, or full webhook body.

## Configuration

Retain:

```env
WAGO_BASE_URL=...
WAGO_API_KEY=...
```

Add only:

```env
WAGO_WEBHOOK_SECRET=<high-entropy-secret>
```

`WAGO_WEBHOOK_SECRET` is optional for backward compatibility, but when present it must meet the same minimum security posture as Wago's generated secret (at least 32 characters/high entropy). Receiver behavior is independent of whether outbound Wago credentials are configured:

- secret present -> signed receiver enabled;
- secret absent -> endpoint returns service-unavailable/configuration response;
- outbound Wago sending continues to follow existing `WAGO_BASE_URL` + `WAGO_API_KEY` rules.

Stable constants remain in code, not env:

- signature tolerance: 5 minutes;
- generic post-submit rejection acceleration: 5 minutes.

Operational callback URL configured in Wago:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

The secret configured in Wago and `WAGO_WEBHOOK_SECRET` must match.

## Supported Envelope

Accept schema version `1` only.

Supported combinations:

- `message.server_accepted` + `data.status = accepted`;
- `message.rejected` + `data.status = rejected` with optional `data.error`.

Required body fields:

- `version`;
- `id`;
- `event`;
- `createdAt`;
- `data.messageId`;
- `data.status`.

Invariants:

- body `id` must equal `Webhook-Id`;
- body `event` must equal `X-Wago-Event`;
- unsupported version/event/status combinations are rejected with `400`.

## Inbox, Deduplication, and Race Handling

After authentication and envelope validation:

1. Insert `WagoWebhookEvent` keyed by `Webhook-Id`.
2. If the key already exists, return `2xx` no-op.
3. Look up `PengirimanNotifikasiWhatsApp` by `transportMessageId`.
4. If not found, leave inbox `processedAt = null` and return `2xx` because the event is already durably retained.
5. If found, resolve the delivery state and mark the inbox row processed in a transaction.

When a delivery record is later persisted after Wago `202`, query unmatched inbox events for that exact `transportMessageId` and process them immediately. This is bounded reconciliation, not polling and not a new scheduler.

## Delivery State Machine

Allowed transitions:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
```

Terminal states never oscillate. If a contradictory later event arrives:

- preserve the first terminal state;
- mark/process the webhook as a no-op anomaly;
- do not change reminder scheduling.

## Retry Acceleration Policy

### `message.server_accepted`

- mark delivery `ACCEPTED`;
- set `resolvedAt`;
- do not alter `nextSendAt`.

### `message.rejected` + `MESSAGE_REJECTED`

- mark delivery `REJECTED`;
- set `errorCode = MESSAGE_REJECTED` and `resolvedAt`;
- only if this is the latest relevant attempt for the active reminder and that reminder is still eligible:

```text
nextSendAt = min(existingNextSendAt, now + 5 minutes)
```

This can accelerate but never delay an earlier existing retry.

### `message.rejected` + `REACHOUT_RESTRICTED`

- mark delivery `REJECTED`;
- store the error;
- do not accelerate schedule.

Wago itself applies a reach-out cooldown, so retrying aggressively would conflict with gateway protections.

### Unknown or empty rejection error

- mark delivery `REJECTED`;
- persist only a bounded/sanitized external code when present;
- do not change `nextSendAt`.

This is the chosen conservative policy.

## Latest-attempt Guard

If attempt A is older than attempt B, a late webhook for A may update A's history but must not modify the current reminder schedule.

Latestness is determined from persisted attempt order for the reminder identity, not webhook arrival order.

## Eligibility Guard

Before schedule acceleration, use the existing centralized `isReminderStillEligible` rule against the current reminder/workflow state.

If the reminder was deleted or is no longer actionable:

- update delivery history if correlated;
- do not recreate a reminder;
- do not change any schedule.

## Module Boundaries

Keep changes inside the existing notifications feature unless HTTP bootstrap/config concerns require shared support.

Recommended structure:

```text
server/src/modules/notifications/reminders/
├── deliveries/
│   ├── notification-delivery.repository.ts
│   ├── notification-delivery.service.ts
│   └── notification-delivery.types.ts
├── webhooks/
│   ├── wago-webhook.controller.ts
│   ├── wago-webhook.service.ts
│   ├── wago-webhook.repository.ts
│   ├── wago-webhook-signature.service.ts
│   └── wago-webhook.types.ts
└── providers/
    └── wago.provider.ts
```

Use fewer files if responsibilities stay clear; do not create ceremonial layers.

Responsibilities:

- `WagoProvider`: outbound HTTP adapter;
- delivery service/repository: attempt persistence and terminal transitions;
- signature service: pure timestamp/HMAC verification;
- webhook repository: durable inbox and dedup;
- webhook service: trusted event processing, reconciliation, latest/eligibility guards;
- controller: HTTP mapping only.

## Transaction Boundaries

Use transactions for state that must change atomically:

- matched webhook inbox processing + delivery terminal transition;
- generic rejection terminal transition + schedule acceleration;
- setting `processedAt` together with the corresponding applied/no-op result.

Do not hold transactions around calls to Wago.

## HTTP/Error Semantics

- valid new event processed or durably stored unmatched: `2xx`;
- duplicate webhook ID: `2xx` no-op;
- missing/malformed signature inputs: existing project `400/401` convention;
- invalid signature: existing unauthorized/forbidden convention;
- timestamp outside tolerance: reject;
- unsupported/inconsistent envelope: `400`;
- webhook secret absent: `503`;
- database failure before durable first insert: `5xx` so Wago retries.

Never return `2xx` for a previously unseen valid event that failed before durable inbox persistence.

## Logging and Security

- Never log `WAGO_API_KEY` or `WAGO_WEBHOOK_SECRET`.
- Never log `Webhook-Signature`.
- Never log reminder message text from webhook handling.
- Log webhook ID, event, opaque/masked transport ID, processing result, and whether retry acceleration occurred.
- Bound/sanitize `data.error` before persistence/logging.
- Keep normal request body limits/security middleware; CORS is irrelevant because this is server-to-server.

## Database Migration

Add a Prisma migration for `PengirimanNotifikasiWhatsApp` and `WagoWebhookEvent`.

Required constraints/indexes:

- unique `idempotencyKey`;
- unique nullable `transportMessageId`;
- index on reminder/business identity plus `submittedAt` for latest-attempt lookup;
- `WagoWebhookEvent.webhookId` primary key;
- index on `transportMessageId, processedAt` for reconciliation;
- nullable reminder FK with `onDelete: SetNull`.

Update `DB-INVARIANTS.md` only if an invariant cannot be expressed clearly by the Prisma schema/application checks.

## Testing Strategy

All production changes use TDD.

### Provider

- `202` returns `transportMessageId`;
- success without message ID returns null safely;
- existing bearer auth, body, phone normalization, timeout, mapping, and idempotency tests remain green;
- duplicate logical success never invents a message ID.

### Signature verifier

- valid signature;
- invalid signature;
- multiple signatures with one match;
- malformed token/base64;
- missing headers;
- stale timestamp;
- excessively future timestamp;
- raw-body byte sensitivity;
- unequal digest lengths handled safely.

### Webhook service

- accepted resolves matching pending attempt;
- `MESSAGE_REJECTED` accelerates latest eligible reminder by at most five minutes;
- an already earlier `nextSendAt` is never delayed;
- `REACHOUT_RESTRICTED` does not accelerate;
- unknown/empty error does not accelerate;
- stale attempt does not accelerate;
- deleted/non-actionable reminder does not accelerate;
- duplicate webhook is no-op;
- webhook-before-attempt is persisted then reconciled;
- contradictory terminal callback cannot oscillate state.

### Repository/integration

- delivery idempotency uniqueness;
- message-ID correlation;
- reminder deletion preserves delivery history;
- inbox deduplication;
- transactionally consistent schedule acceleration.

### HTTP boundary

- real raw-body verification through Nest/Express;
- JWT is not required, but unsigned/invalid requests fail;
- header/body ID mismatch fails;
- event header/body mismatch fails;
- supported v1 envelope succeeds;
- database failure returns retryable server error.

### Regression gate

Run server typecheck, lint, unit tests, integration tests, build, and repository CI. Do not weaken unrelated tests/security middleware.

## Deployment

1. Deploy SOPFlow with this migration/receiver.
2. Set `WAGO_WEBHOOK_SECRET` on SOPFlow backend.
3. In Wago Settings -> Webhook Integration, set callback URL to:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

4. Configure the same signing secret.
5. Enable Wago webhook delivery.
6. Perform a controlled reminder send and verify `PENDING -> ACCEPTED` or `PENDING -> REJECTED` history.

If SOPFlow is temporarily unavailable, Wago's durable webhook outbox retries. If the webhook integration is disabled, SOPFlow's existing normal reminder scheduler continues to operate.

## Acceptance Criteria

Complete when:

- successful Wago submissions persist one logical delivery row keyed by reminder occurrence idempotency;
- Wago message IDs are retained as `transportMessageId` when available;
- callbacks are authenticated against exact raw body with a five-minute tolerance;
- webhook IDs are durably deduplicated;
- callback-before-attempt races are retained and reconciled when correlation becomes available;
- accepted callbacks update transport history only;
- latest eligible `MESSAGE_REJECTED` accelerates `nextSendAt` to no later than five minutes from processing;
- `REACHOUT_RESTRICTED`, unknown, and empty errors do not accelerate;
- stale attempts and obsolete reminders never mutate current scheduling;
- duplicate/conflicting callbacks cannot repeatedly or reversibly mutate terminal state;
- no network call is inside a DB transaction;
- the rare crash-before-receipt-persistence correlation gap degrades safely without guessing;
- focused tests and repository quality gates pass;
- deployment docs describe callback URL and signing-secret setup accurately.
