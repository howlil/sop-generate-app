# Wago Notification Provider Refactor Design

Date: 2026-08-11
Status: Approved design
Target branch: `refactor-wago-notification-provider`
Base branch: `cleanup/legacy-code-docs`

## Context

SOPFlow currently sends WhatsApp reminders through a WhaAPI-specific provider. The application will instead use the self-hosted Wago gateway from `howlil/wago`. Wago exposes a bearer-authenticated REST API, enforces its own recipient allowlist/opt-out policy, and supports idempotent outbound text sends.

Recipient permission remains operationally managed in Wago. SOPFlow must not auto-allow recipients and must not bypass Wago policy.

## Goals

- Replace the WhaAPI-specific notification provider with a Wago-specific provider.
- Remove obsolete WhaAPI configuration and documentation.
- Preserve the existing notification domain boundary through `NotificationChannel`.
- Keep recipient allow/opt-out management manual in Wago.
- Integrate Wago idempotency so transport retries cannot create duplicate logical reminder sends.
- Map Wago errors into the existing `NotificationChannelError` taxonomy so the reminder worker can apply appropriate retry behavior.
- Avoid database migrations and unrelated notification redesign.

## Non-goals

- No recipient auto-registration from SOPFlow to Wago.
- No calls to `/recipients/allow` or `/recipients/:phone/opt-out` from SOPFlow.
- No Wago dashboard integration into the SOPFlow frontend.
- No inbound WhatsApp handling, webhooks, media, delivery receipts, broadcast, or multi-session behavior.
- No retry-policy redesign beyond the minimal changes needed for Wago error semantics.
- No changes to unrelated workflow or E2E defects.

## Wago API Contract Used by SOPFlow

SOPFlow uses one Wago endpoint:

```http
POST /messages/send
Authorization: Bearer <WAGO_API_KEY>
Content-Type: application/json
Idempotency-Key: <logical-send-key>

{
  "to": "6281234567890",
  "text": "..."
}
```

Expected successful response is HTTP 202 with a payload containing `success`, `messageId`, and `status`.

SOPFlow does not require `/messages/:id/status` because the existing reminder model only needs acceptance/failure at send time and Wago does not expose delivery/read receipts as part of the current public contract.

## Configuration

Remove:

- `WHAAPI_BASE_URL`
- `WHAAPI_TOKEN`
- `WHAAPI_CHANNEL_ID`
- `WHATSAPP_ALLOWED_RECIPIENTS`

Add:

- `WAGO_BASE_URL`
- `WAGO_API_KEY`
- `WAGO_REQUEST_TIMEOUT_MS`

Retain notification runtime settings that are independent of the provider:

- `WHATSAPP_REMINDER_INTERVAL_MINUTES`
- `WHATSAPP_MAX_CONCURRENCY`
- `WHATSAPP_LOCK_LEASE_SECONDS`

Activation rule:

- Both `WAGO_BASE_URL` and `WAGO_API_KEY` empty: outbound WhatsApp disabled.
- Both present: outbound WhatsApp enabled.
- Exactly one present: startup validation error.

`WAGO_BASE_URL` must be a valid URL and should not contain a trailing slash after normalization inside the provider.

## Provider Boundary

Rename the provider implementation from `WhaApiProvider` to `WagoProvider` and keep it behind the existing `NOTIFICATION_CHANNEL` token.

Extend `NotificationChannel.send` minimally:

```ts
send(
  destination: string,
  message: string,
  options?: { idempotencyKey?: string },
): Promise<void>;
```

This keeps Wago-specific transport concerns out of the reminder worker while allowing the worker to provide a logical-send identity.

## Phone Handling

SOPFlow normalizes Indonesian local numbers before sending:

- non-digit formatting is removed;
- a leading `0` becomes country code `62`;
- already international digit-only values remain unchanged.

Wago also performs normalization, but SOPFlow should still send a canonical destination so logs, tests, and outbound requests are deterministic.

## Recipient Policy

Recipient allow/opt-out state is owned by Wago.

SOPFlow will not call any recipient-management API. If a number is not allowed or is opted out, Wago rejects the send and SOPFlow records a channel failure. After an operator manually allows the recipient in Wago, a later scheduled SOPFlow reminder attempt can succeed without changing SOPFlow data.

## Idempotency Design

Wago supports `Idempotency-Key` and rejects duplicate logical sends. SOPFlow must provide a stable key for retries of the same reminder occurrence, while generating a new key after a successful reminder occurrence.

The reminder repository must expose `lastSentAt` on `ClaimedNotificationReminder`.

The worker derives a key from:

```text
sopflow-reminder:<notificationReminderId>:<lastSentAt-or-initial>
```

Examples:

```text
sopflow-reminder:abc123:initial
sopflow-reminder:abc123:1786401234000
```

Behavior:

- network timeout after Wago accepted the first attempt -> retry uses the same key;
- Wago returns `DUPLICATE_MESSAGE` -> SOPFlow treats the logical send as successful;
- once SOPFlow marks a send successful, `lastSentAt` changes;
- the next scheduled reminder occurrence therefore gets a new idempotency key.

No database schema change is required.

## Error Mapping

The provider must parse Wago JSON error bodies when available. HTTP status alone is insufficient because different Wago conditions can share the same status.

Mapping:

| Wago condition | SOPFlow channel result |
| --- | --- |
| `401 UNAUTHORIZED` | `UNAUTHORIZED` |
| `403 API_KEY_REQUIRED` | `CONFIGURATION` |
| `403 RECIPIENT_NOT_ALLOWED` | `BAD_RECIPIENT` |
| `403 RECIPIENT_OPTED_OUT` | `BAD_RECIPIENT` |
| `400 INVALID_PHONE` | `BAD_RECIPIENT` |
| `404 PHONE_NOT_ON_WHATSAPP` | `BAD_RECIPIENT` |
| `409 DUPLICATE_MESSAGE` | logical success |
| `429 RECIPIENT_RATE_LIMITED` | `RATE_LIMITED` |
| `429 ACCOUNT_RATE_LIMITED` | `RATE_LIMITED` |
| `429 NEW_CHAT_RATE_LIMITED` | `RATE_LIMITED` |
| `429 WA_REACHOUT_RESTRICTED` | `RATE_LIMITED` |
| other `429` | `RATE_LIMITED` |
| `503 WHATSAPP_NOT_CONNECTED` | `UNAVAILABLE` |
| `503 OUTBOUND_PAUSED` | `UNAVAILABLE` |
| `502 MESSAGE_REJECTED` | `UNAVAILABLE` |
| timeout | `TIMEOUT` |
| network failure | `UNAVAILABLE` |
| other 5xx | `UNAVAILABLE` |
| unknown response | `UNKNOWN` |

When a retry time can be derived from a Wago response in the future, it may be mapped to `retryAfterMs`; the current integration does not require inventing retry times not provided by the API.

`BAD_RECIPIENT` remains retryable according to the existing worker's reminder interval. This intentionally supports the manual-allow workflow.

## Logging and Security

- Never log `WAGO_API_KEY`.
- Mask recipient numbers in provider logs.
- Limit logged error body length.
- Do not include message text in warning/error logs.
- Keep the Wago API key only on the server side.

## File-level Changes

Expected changes include:

- delete `server/src/modules/notifications/reminders/providers/whaapi.provider.ts`
- add `server/src/modules/notifications/reminders/providers/wago.provider.ts`
- add focused `wago.provider.spec.ts`
- update `notification-channel.interface.ts`
- update `push-reminder-worker.service.ts` and tests for idempotency
- update `notification-reminder.repository.ts` and types to expose `lastSentAt`
- update `notification-reminder-scheduler.service.ts` and tests
- update `notification.module.ts`
- update environment validation and tests
- update `.env.example`, `server/.env.test`, `compose.yml`, CI env as needed
- update README/docs containing WhaAPI terminology
- remove all remaining `WHAAPI_*`, `WhaAPI`, and `WhaApiProvider` references from active code/docs

## Testing Strategy

Provider tests must cover:

- 202 accepted response;
- bearer authentication;
- `{ to, text }` payload;
- `Idempotency-Key` header;
- destination normalization;
- timeout handling;
- network failure;
- Wago JSON error parsing;
- all meaningful error mappings listed above;
- duplicate-message treated as logical success;
- no secret/message leakage in normal provider behavior.

Worker tests must cover:

- the same logical reminder occurrence reuses its key across retries;
- a later occurrence after success uses a new key;
- existing retry scheduling remains intact.

Environment tests must cover:

- empty Wago pair accepted and disables outbound WhatsApp;
- valid URL + API key accepted;
- URL without key rejected;
- key without URL rejected.

Repository-wide verification should include server typecheck, lint, unit tests, build, and existing project CI. Known unrelated E2E failures must not be hidden or weakened.

## Migration and Deployment

There is no database migration.

Deployment steps are operational:

1. Deploy and initialize Wago.
2. Pair the sender WhatsApp account in Wago.
3. Store the Wago API key securely.
4. Manually allow intended recipient numbers in Wago.
5. Configure SOPFlow with `WAGO_BASE_URL` and `WAGO_API_KEY`.
6. Deploy SOPFlow.

If Wago is unavailable, not connected, paused, or rejects a recipient, SOPFlow must retain the reminder and follow its normal retry scheduling rather than losing the notification state.

## Acceptance Criteria

The refactor is complete when:

- active SOPFlow code no longer depends on WhaAPI;
- Wago is the only outbound WhatsApp transport provider;
- no recipient is auto-allowed by SOPFlow;
- sends use bearer auth and Wago's `/messages/send` contract;
- duplicate transport retries do not duplicate logical reminder sends;
- Wago errors map predictably into existing worker behavior;
- all focused tests and repository quality gates pass except any explicitly documented pre-existing unrelated failure;
- deployment docs describe the manual Wago recipient allow workflow and required `WAGO_*` configuration.
