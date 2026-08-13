# Wago Delivery Webhook Integration Design

Date: 2026-08-13
Status: Approved design
Target branch: `feat/wago-delivery-webhook`
Base branch: `main`

## Context

SOPFlow already sends WhatsApp reminders through the Wago provider. The current provider calls `POST /messages/send` with bearer authentication, normalized destination numbers, and an `Idempotency-Key`. The reminder worker treats Wago's HTTP acceptance as transport submission success and schedules the next reminder occurrence.

Wago now also exposes durable signed delivery webhooks for outbound message state transitions. The callback events are `message.server_accepted` and `message.rejected`. Webhook delivery is at least once, signed with HMAC-SHA256, retried durably by Wago, and can be manually redelivered with the same webhook delivery ID.

This integration adds inbound webhook handling to SOPFlow so notification delivery attempts can be tracked and selected post-submit rejections can accelerate the next retry without coupling Wago directly to reminder business state.

## Goals

- Persist a transport delivery attempt for every Wago reminder send occurrence.
- Correlate Wago webhook callbacks to the exact transport attempt by Wago `messageId`.
- Verify Wago webhook signatures against the raw request body before trusting the payload.
- Deduplicate callbacks using `Webhook-Id`.
- Track `PENDING`, `ACCEPTED`, and `REJECTED` transport outcomes independently from reminder business lifecycle state.
- Accelerate the next reminder retry by five minutes only for the latest relevant attempt rejected with `MESSAGE_REJECTED`.
- Do not accelerate retries for `REACHOUT_RESTRICTED`, unknown, or empty rejection codes.
- Ignore stale attempt callbacks for reminder scheduling while still recording their delivery history.
- Preserve the existing scheduler as the only executor of reminder sends.
- Keep the notification channel abstraction provider-agnostic.
- Avoid Redis, Kafka, a new queue, frontend webhook handling, or Wago polling.

## Non-goals

- No delivery/read receipt claims beyond Wago's server acknowledgement.
- No frontend delivery dashboard in this task.
- No Wago recipient allow/opt-out management from SOPFlow.
- No inbound WhatsApp message handling.
- No generic event bus or message broker.
- No direct webhook-triggered call to the reminder worker.
- No change to the business rules that decide which reminder kinds are actionable.
- No retry acceleration for Wago policy failures returned synchronously by `POST /messages/send`; those remain handled by the existing provider/worker error taxonomy.

## Architecture

The integration has three explicit state boundaries.

### 1. Reminder business state

Existing `PengingatWhatsApp` remains the active reminder state. It answers whether a reminder should still exist, who should receive it, when it should be sent next, and the current retry counters.

It is not converted into a delivery history table.

### 2. Delivery attempt state

Add a persistent delivery-attempt model, tentatively named `PengirimanNotifikasiWhatsApp`.

Each row represents one logical reminder send occurrence and stores the transport identity needed to correlate later callbacks.

Required fields:

- `pengirimanNotifikasiWhatsAppId` UUID primary key;
- `pengingatWhatsAppId` UUID foreign key to the active reminder when it still exists;
- snapshot business identity fields needed after the reminder row is deleted: `pengajuanEvaluasiId`, `penggunaId`, `jenis`;
- `idempotencyKey` unique;
- `transportMessageId` nullable unique;
- `status` enum: `PENDING`, `ACCEPTED`, `REJECTED`;
- `errorCode` nullable bounded string;
- `submittedAt`;
- `resolvedAt` nullable;
- `createdAt` and `updatedAt`.

The snapshot identity fields are intentional. `PengingatWhatsApp` rows are lifecycle state and can be removed when the underlying workflow changes. Historical webhook callbacks must still be recordable after that removal without preserving obsolete business state solely for referential convenience.

Foreign-key behavior from delivery attempt to active reminder should therefore be nullable with `onDelete: SetNull` rather than cascade.

### 3. Webhook inbox state

Add a persistent inbox model, tentatively named `WagoWebhookEvent`.

Required fields:

- `webhookId` primary key from `Webhook-Id`;
- `transportMessageId`;
- `event`;
- `status`;
- `errorCode` nullable;
- `sourceCreatedAt` from Wago payload;
- `receivedAt`;
- `processedAt` nullable;
- optional compact processing result such as `MATCHED`, `UNMATCHED`, `STALE`, or `DUPLICATE` only if it materially improves operations/tests; do not add a complex state machine unless required by implementation.

The primary purpose is durable idempotency and race-safe correlation.

## Notification Channel Contract

The existing channel contract returns `Promise<void>`, which discards the Wago `messageId` required for webhook correlation.

Change the provider-agnostic boundary to return a transport receipt:

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

The domain layer must use `transportMessageId`, not `wagoMessageId`, so replacing the transport provider later does not leak Wago terminology into business logic.

`WagoProvider` parses the successful `202` response and returns its `messageId` as `transportMessageId`.

A successful response without a usable `messageId` is still a valid transport submission but cannot be correlated to a later webhook; the attempt remains stored with `transportMessageId = null`. This should be logged as a warning and covered by tests, but must not invent an identifier.

## Send Flow

For each claimed reminder occurrence:

1. Confirm the reminder remains eligible using the existing eligibility rules.
2. Build the reminder message and stable idempotency key exactly as today.
3. Call `NotificationChannel.send()`.
4. Receive a `NotificationSendReceipt` from Wago.
5. Persist a delivery-attempt row containing the reminder identity, idempotency key, returned transport message ID, and `PENDING` status.
6. Mark the reminder occurrence successful using the existing reminder scheduling behavior.

The attempt record must use the same logical idempotency key sent to Wago.

### Duplicate-message behavior

Wago currently returns `DUPLICATE_MESSAGE` as a synchronous policy rejection when the same idempotency key is active. SOPFlow currently treats this as logical success.

For this integration, the provider must preserve logical-success behavior, but duplicate handling must not create a second delivery-attempt row for the same `idempotencyKey`.

The delivery-attempt table's unique idempotency key provides the persistence guard. If a prior attempt row already exists, reuse it as the logical occurrence record rather than creating another row.

No assumption is made that a duplicate response contains the original Wago message ID. Existing correlation remains based on the first successful attempt record.

## Webhook HTTP Endpoint

Add an unauthenticated-by-user-session internal integration endpoint:

```text
POST /api/v1/webhooks/wago
```

This endpoint does not use SOPFlow JWT or cookies. The Wago HMAC signature is the authentication mechanism.

The controller must be intentionally narrow:

- read validated headers and the raw JSON request body;
- delegate signature verification;
- validate the envelope shape after authenticity is established;
- pass the trusted event to the application service;
- return a success response for accepted or already-processed webhook IDs;
- return client error for malformed/invalid signatures or unsupported schema/event values;
- do not perform reminder-worker execution in the controller.

## Raw-body Requirement

Wago signs this exact UTF-8 material:

```text
<webhook-id>.<webhook-timestamp>.<raw-json-request-body>
```

Therefore SOPFlow must verify against the original raw bytes/body string received from the network. It must not `JSON.stringify()` the parsed body and treat that as equivalent.

The NestJS bootstrap currently disables default body parsing and installs explicit JSON/urlencoded parsers. The implementation must extend that parser configuration to retain the raw JSON bytes/body in a request-local property without adding a second competing parser.

The raw-body support must be isolated to request parsing and exposed through a small typed helper/decorator or request type. Business services must not depend on Express internals.

## Signature Verification

Required Wago headers:

- `Webhook-Id`;
- `Webhook-Timestamp`;
- `Webhook-Signature`;
- `X-Wago-Event`.

Verification steps:

1. Reject missing required headers.
2. Parse `Webhook-Timestamp` as Unix seconds.
3. Require timestamp age within ±5 minutes of server time.
4. Build signing material from webhook ID, timestamp string, and exact raw request body.
5. Parse one or more space-separated signatures from `Webhook-Signature` in the form `v1,<base64>`.
6. Compute HMAC-SHA256 using `WAGO_WEBHOOK_SECRET`.
7. Decode and compare candidate signatures using constant-time comparison (`timingSafeEqual`) only when byte lengths match.
8. Reject if no signature matches.
9. Only after successful authentication should the body be trusted as a Wago event.

Do not log the secret, raw signature material, or full webhook body.

## Secret Configuration

Add one server-only variable:

```env
WAGO_WEBHOOK_SECRET=<high-entropy-secret-generated-by-Wago>
```

Retain existing:

```env
WAGO_BASE_URL=...
WAGO_API_KEY=...
```

Do not add extra tuning environment variables for stable implementation constants.

Stable constants remain in code:

- signature timestamp tolerance: 5 minutes;
- accelerated retry delay for generic post-submit rejection: 5 minutes.

Webhook receiver activation rule:

- if Wago outbound is configured and `WAGO_WEBHOOK_SECRET` is present, the receiver accepts signed callbacks;
- if the endpoint is hit without a configured secret, return service-unavailable/configuration error rather than accepting unsigned callbacks;
- existing outbound Wago sending may remain usable without webhook configuration, preserving backward-compatible deployment behavior.

The Wago dashboard callback should be configured operationally to:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

The signing secret generated/configured in Wago must match `WAGO_WEBHOOK_SECRET` in SOPFlow.

## Supported Envelope

Accept Wago webhook schema version `1` only.

Supported events:

- `message.server_accepted` with `data.status = accepted`;
- `message.rejected` with `data.status = rejected` and optional `data.error`.

Required envelope values:

- `version`;
- `id`;
- `event`;
- `createdAt`;
- `data.messageId`;
- `data.status`.

The body `id` should equal the `Webhook-Id` header. Mismatch is rejected because it creates ambiguous deduplication identity.

`X-Wago-Event` should equal the body `event`. Mismatch is rejected.

Unknown schema versions and unsupported events are rejected explicitly rather than silently processed.

## Inbox and Idempotency Flow

After signature and envelope validation:

1. Attempt to insert `WagoWebhookEvent` keyed by `Webhook-Id`.
2. If it already exists, return success without reapplying mutations.
3. Find the delivery attempt by `transportMessageId`.
4. If no attempt exists yet, retain the inbox row as unprocessed/unmatched and return success.
5. If an attempt exists, apply delivery state and mark the inbox row processed atomically where practical.

Wago's at-least-once behavior means duplicate delivery is normal and must not be reported as an application error.

## Race-safe Reconciliation

The callback can arrive before SOPFlow finishes persisting the delivery attempt after Wago returns `202`.

To avoid losing the event:

- unmatched signed callbacks are persisted in the webhook inbox;
- after a delivery attempt is inserted or recovered, the delivery service checks for unmatched webhook events with the same `transportMessageId` and processes them;
- this reconciliation is database-backed and bounded to that message ID, not a general polling loop.

No cron job is required solely for webhook correlation.

## Delivery State Transitions

Allowed transitions for one delivery attempt:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
```

Once resolved, duplicate or contradictory later events must not oscillate the record.

If an already `ACCEPTED` attempt receives a later rejection or vice versa, retain the first terminal state and record/log the conflicting webhook as a no-op anomaly. Do not change reminder scheduling based on a conflicting terminal callback.

## Retry Acceleration Policy

Webhook callbacks update delivery tracking first. Scheduling side effects are narrowly constrained.

### `message.server_accepted`

- set matching delivery attempt to `ACCEPTED`;
- set `resolvedAt`;
- do not change reminder `nextSendAt`;
- do not claim recipient device delivery or read status.

### `message.rejected` + `MESSAGE_REJECTED`

- set matching delivery attempt to `REJECTED`;
- store `errorCode = MESSAGE_REJECTED`;
- if and only if this attempt is the latest relevant attempt for the active reminder and the reminder is still eligible, set:

```text
nextSendAt = min(existingNextSendAt, now + 5 minutes)
```

This accelerates but never delays an already-earlier retry.

### `message.rejected` + `REACHOUT_RESTRICTED`

- set matching delivery attempt to `REJECTED`;
- store `errorCode = REACHOUT_RESTRICTED`;
- do not accelerate the reminder schedule.

Wago itself applies a recipient reach-out cooldown, so aggressive retry would conflict with gateway protection.

### Unknown or empty rejection error

- set matching delivery attempt to `REJECTED`;
- store the bounded/sanitized code when present;
- do not modify `nextSendAt`.

This is the chosen conservative policy: unknown errors neither trigger aggressive retries nor disable the normal reminder lifecycle.

## Latest-attempt Guard

A webhook may arrive late after a newer reminder occurrence has already been sent.

Example:

```text
Attempt A -> messageId AAA
Attempt B -> messageId BBB (newer)
late rejection arrives for AAA
```

Required behavior:

- mark Attempt A rejected for history;
- do not modify the active reminder schedule because A is no longer the latest attempt.

The application service must determine latestness using persisted attempt ordering for the reminder identity, not arrival order of webhooks.

## Eligibility Guard

Before any webhook-triggered schedule acceleration, re-check that the reminder is still actionable using the same central eligibility rule used by the worker.

If the reminder row no longer exists or the underlying workflow no longer matches the expected status/role:

- delivery history still updates;
- no active reminder is recreated;
- no schedule is changed.

Webhook processing must never become a backdoor that revives obsolete reminders.

## Repository Boundaries

Recommended modules under the existing notifications feature:

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

Do not create layers/files merely to satisfy this exact tree if a smaller grouping remains clearer. Preserve the repository's existing pragmatic feature-first style.

Responsibilities:

- `WagoProvider`: outbound HTTP adapter only;
- delivery repository/service: persist and resolve transport attempts;
- signature service: pure HMAC/timestamp verification;
- webhook repository: inbox deduplication/correlation persistence;
- webhook service: trusted event processing and scheduling policy;
- controller: HTTP boundary only.

## Transaction Boundaries

Use database transactions for mutations that must be observed atomically:

- inserting a webhook inbox row and applying a matched terminal delivery transition where practical;
- resolving a delivery rejection and accelerating `nextSendAt`;
- marking inbox processing completion with the corresponding delivery mutation.

Do not hold a database transaction open while making network calls to Wago.

Outbound flow remains network first, then persistence of the receipt, because the Wago `messageId` only exists after the send response. Idempotency protects repeated network submission of the same logical occurrence.

## Error Handling

Webhook endpoint response semantics:

- valid new event processed or durably stored unmatched: `2xx`;
- valid duplicate `Webhook-Id`: `2xx` no-op;
- missing/malformed signature headers: `400` or `401` according to existing HTTP error conventions;
- invalid signature: `401`/forbidden equivalent according to project conventions;
- stale/future timestamp outside tolerance: reject;
- unsupported schema/event or inconsistent headers/body: `400`;
- receiver secret not configured: `503` configuration unavailable;
- transient database failure before durable inbox persistence: `5xx` so Wago retries.

Do not return `2xx` if SOPFlow failed before durably recording a previously unseen valid webhook event.

## Logging and Security

- Never log `WAGO_API_KEY` or `WAGO_WEBHOOK_SECRET`.
- Never log `Webhook-Signature` values.
- Do not log reminder message text from webhook processing.
- Log webhook IDs, event names, masked/opaque transport message IDs, result category, and whether scheduling was accelerated.
- Sanitize/bound external `data.error` before persistence/logging.
- Keep webhook endpoint outside user authentication while still protected by HMAC and normal infrastructure rate/body-size controls.
- No CORS requirement exists for server-to-server webhook delivery.

## Database Migration

A Prisma migration is required for delivery-attempt and webhook-inbox persistence.

Migration must include:

- unique `idempotencyKey` on delivery attempts;
- unique nullable `transportMessageId` where supported by MySQL semantics;
- index on reminder/business identity plus submission time for latest-attempt lookup;
- webhook inbox primary key on `webhookId`;
- index on inbox `transportMessageId` and `processedAt` for bounded reconciliation;
- nullable reminder foreign key with `onDelete: SetNull` if the active reminder relation is retained.

Update `DB-INVARIANTS.md` only if this task introduces an invariant not sufficiently represented by schema constraints/application checks.

## Testing Strategy

Use TDD for all implementation changes.

### Provider tests

Cover:

- Wago `202` response returns `transportMessageId`;
- null/missing message ID handling;
- existing bearer auth, payload, timeout, error mapping, and idempotency behavior remain intact;
- duplicate logical success does not fabricate a new message ID.

### Signature verifier tests

Cover:

- valid signature;
- invalid signature;
- multiple signature tokens with one valid candidate;
- malformed base64/signature format;
- missing headers;
- timestamp too old;
- timestamp too far in the future;
- exact raw-body sensitivity;
- constant-time comparison path handles unequal lengths safely.

### Webhook service tests

Cover:

- accepted event resolves matching attempt;
- generic `MESSAGE_REJECTED` accelerates latest eligible reminder to no later than `now + 5m`;
- acceleration never delays an earlier existing schedule;
- `REACHOUT_RESTRICTED` does not accelerate;
- unknown/empty rejection does not accelerate;
- stale attempt does not accelerate;
- non-actionable/deleted reminder does not accelerate;
- duplicate webhook ID is no-op;
- callback before attempt is persisted then reconciled after attempt creation;
- terminal state is not oscillated by conflicting callbacks.

### Repository/integration tests

Cover:

- delivery idempotency-key uniqueness;
- transport-message correlation;
- nullable reminder relation survives active reminder deletion;
- webhook inbox persistence/deduplication;
- transactional schedule acceleration behavior.

### HTTP tests

Cover:

- real raw-body signature verification through Nest/Express boundary;
- endpoint bypasses JWT but rejects unsigned/invalid signed requests;
- header/body ID mismatch rejected;
- `X-Wago-Event`/body mismatch rejected;
- supported version/event succeeds;
- database failure returns retryable server error.

### Regression verification

Run existing server typecheck, lint, unit tests, integration tests, build, and repository CI. Do not weaken unrelated tests or security middleware.

## Deployment

1. Deploy SOPFlow version containing the webhook receiver and migration.
2. Set `WAGO_WEBHOOK_SECRET` in the SOPFlow backend environment.
3. In Wago Settings -> Webhook Integration, configure callback URL:

```text
https://<sopflow-host>/api/v1/webhooks/wago
```

4. Configure the same signing secret in Wago/SOPFlow.
5. Enable webhook delivery in Wago.
6. Verify with a controlled reminder send that SOPFlow records `PENDING`, then receives `ACCEPTED` or `REJECTED`.

If webhook delivery is temporarily unavailable, Wago's durable outbox retries callbacks. SOPFlow's normal reminder scheduler continues to function independently; webhook integration improves tracking and selected retry timing but is not required for the core reminder lifecycle to exist.

## Acceptance Criteria

Implementation is complete when:

- SOPFlow persists one logical delivery attempt per reminder occurrence;
- Wago `messageId` is retained as provider-agnostic `transportMessageId`;
- valid Wago callbacks are authenticated using raw-body HMAC and a five-minute timestamp tolerance;
- webhook delivery IDs are durably deduplicated;
- webhook-before-attempt races are retained and reconciled;
- accepted callbacks update transport history without changing normal reminder schedule;
- latest eligible generic `MESSAGE_REJECTED` callbacks accelerate `nextSendAt` to at most five minutes from processing time;
- `REACHOUT_RESTRICTED`, unknown, and empty rejection codes do not accelerate retries;
- stale attempts and obsolete reminders never mutate current scheduling;
- duplicate or conflicting callbacks cannot repeatedly or reversibly mutate terminal state;
- no network call runs inside a database transaction;
- all relevant focused tests and repository quality gates pass;
- deployment/config documentation accurately describes the Wago callback URL and signing secret setup.
