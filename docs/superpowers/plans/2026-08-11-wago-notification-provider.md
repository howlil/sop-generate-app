# Wago Notification Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WhaAPI-specific WhatsApp notification transport with the self-hosted Wago API while preserving SOPFlow reminder behavior, manual recipient allowlisting, and retry safety.

**Architecture:** Keep `NotificationChannel` as the transport boundary, replace `WhaApiProvider` with `WagoProvider`, and pass a stable logical-send idempotency key from the reminder worker. Wago owns recipient allow/opt-out policy; SOPFlow only sends text messages and maps Wago errors into the existing channel error taxonomy.

**Tech Stack:** NestJS, TypeScript, native `fetch`, Zod environment validation, Jest, Prisma-backed reminder repository.

## Global Constraints

- SOPFlow must never auto-allow Wago recipients.
- Use only `POST /messages/send` for outbound WhatsApp notifications.
- Authentication is `Authorization: Bearer <WAGO_API_KEY>`.
- `WAGO_BASE_URL` and `WAGO_API_KEY` are an all-or-nothing activation pair.
- No database migration.
- Preserve existing reminder retry scheduling except for Wago-specific error classification and idempotency.
- `409 DUPLICATE_MESSAGE` is treated as logical success.
- Do not expose `WAGO_API_KEY`, message text, or full phone numbers in logs.
- Do not touch unrelated business workflows or the known J04 E2E defect.

---

### Task 1: Wago configuration contract

**Files:**
- Modify: `server/src/config/env.validation.ts`
- Modify: `server/src/config/env.validation.spec.ts`
- Modify: `.env.example`
- Modify: `server/.env.test`
- Modify: `compose.yml`
- Modify: `.github/workflows/ci.yml` only where provider-specific environment variables exist

**Interfaces:**
- Produces environment keys `WAGO_BASE_URL`, `WAGO_API_KEY`, `WAGO_REQUEST_TIMEOUT_MS`.
- Preserves `WHATSAPP_REMINDER_INTERVAL_MINUTES`, `WHATSAPP_MAX_CONCURRENCY`, `WHATSAPP_LOCK_LEASE_SECONDS`.

- [ ] **Step 1: Write failing env-validation tests**

Add cases proving:

```ts
expect(() => validateEnv(baseEnv({ WAGO_BASE_URL: '', WAGO_API_KEY: '' }))).not.toThrow();
expect(() => validateEnv(baseEnv({ WAGO_BASE_URL: 'https://wago.example.test', WAGO_API_KEY: 'wa_test_key' }))).not.toThrow();
expect(() => validateEnv(baseEnv({ WAGO_BASE_URL: 'https://wago.example.test', WAGO_API_KEY: '' }))).toThrow(/WAGO_API_KEY/);
expect(() => validateEnv(baseEnv({ WAGO_BASE_URL: '', WAGO_API_KEY: 'wa_test_key' }))).toThrow(/WAGO_BASE_URL/);
```

- [ ] **Step 2: Run the focused env tests and confirm RED**

Run the repository's existing Jest command for `env.validation.spec.ts`. Expected: failures because `WAGO_*` is not yet the active contract.

- [ ] **Step 3: Replace WhaAPI keys in `env.validation.ts`**

Define:

```ts
WAGO_BASE_URL: optionalUrl,
WAGO_API_KEY: z.preprocess(trimmedEnvironmentString, z.string().default('')),
WAGO_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
```

In `superRefine`, normalize presence as:

```ts
const hasWagoBaseUrl = data.WAGO_BASE_URL !== undefined;
const hasWagoApiKey = data.WAGO_API_KEY !== '';
if (hasWagoBaseUrl !== hasWagoApiKey) {
  // add issue on whichever counterpart is missing
}
```

Delete `WHAAPI_BASE_URL`, `WHAAPI_TOKEN`, `WHAAPI_CHANNEL_ID`, and `WHATSAPP_ALLOWED_RECIPIENTS` from the active schema.

- [ ] **Step 4: Update deployment/test environment files**

Use:

```env
WAGO_BASE_URL=
WAGO_API_KEY=
WAGO_REQUEST_TIMEOUT_MS=10000
```

Keep provider-independent WhatsApp reminder settings unchanged.

- [ ] **Step 5: Re-run focused env tests and confirm GREEN**

Expected: all Wago pair tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/src/config/env.validation.ts server/src/config/env.validation.spec.ts .env.example server/.env.test compose.yml .github/workflows/ci.yml
git commit -m "refactor(config): replace WhaAPI settings with Wago"
```

---

### Task 2: Wago transport provider

**Files:**
- Delete: `server/src/modules/notifications/reminders/providers/whaapi.provider.ts`
- Create: `server/src/modules/notifications/reminders/providers/wago.provider.ts`
- Create: `server/src/modules/notifications/reminders/providers/wago.provider.spec.ts`
- Modify: `server/src/modules/notifications/reminders/providers/notification-channel.interface.ts`
- Modify: `server/src/modules/notifications/reminders/notification.module.ts`

**Interfaces:**
- `NotificationChannel.send(destination: string, message: string, options?: { idempotencyKey?: string }): Promise<void>`
- `WagoProvider` consumes `WAGO_BASE_URL`, `WAGO_API_KEY`, `WAGO_REQUEST_TIMEOUT_MS`.

- [ ] **Step 1: Extend `NotificationChannel` in a failing provider test**

Provider tests must assert a call creates:

```ts
expect(fetch).toHaveBeenCalledWith(
  'https://wago.example.test/messages/send',
  expect.objectContaining({
    method: 'POST',
    headers: expect.objectContaining({
      Authorization: 'Bearer wa_test_key',
      'Content-Type': 'application/json',
      'Idempotency-Key': 'sopflow-reminder:r1:initial',
    }),
    body: JSON.stringify({ to: '6285373945490', text: 'Pesan uji' }),
  }),
);
```

Also cover local `08...` normalization to `628...`.

- [ ] **Step 2: Add failing error-mapping tests**

Cover JSON errors:

```text
UNAUTHORIZED -> UNAUTHORIZED
API_KEY_REQUIRED -> CONFIGURATION
RECIPIENT_NOT_ALLOWED -> BAD_RECIPIENT
RECIPIENT_OPTED_OUT -> BAD_RECIPIENT
INVALID_PHONE -> BAD_RECIPIENT
PHONE_NOT_ON_WHATSAPP -> BAD_RECIPIENT
DUPLICATE_MESSAGE -> success
*_RATE_LIMITED -> RATE_LIMITED
WA_REACHOUT_RESTRICTED -> RATE_LIMITED
WHATSAPP_NOT_CONNECTED -> UNAVAILABLE
OUTBOUND_PAUSED -> UNAVAILABLE
MESSAGE_REJECTED -> UNAVAILABLE
```

Also test timeout -> `TIMEOUT`, network failure -> `UNAVAILABLE`, unknown 4xx -> `UNKNOWN`, unknown 5xx -> `UNAVAILABLE`.

- [ ] **Step 3: Run focused provider tests and confirm RED**

Expected: missing `WagoProvider` / old interface behavior.

- [ ] **Step 4: Implement `WagoProvider` minimally**

Core send flow:

```ts
const response = await fetch(`${this.baseUrl}/messages/send`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.apiKey}`,
    ...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
  },
  body: JSON.stringify({ to: phoneNumber, text: message }),
  signal: controller.signal,
});
```

Normalize `baseUrl` by removing trailing `/` in the constructor. Never log the key or message body. Mask phone numbers.

Parse non-2xx bodies defensively:

```ts
type WagoErrorBody = { error?: unknown; message?: unknown };
```

Map primarily from `error` code and use HTTP status only as fallback. Return without throwing for `409 DUPLICATE_MESSAGE`.

- [ ] **Step 5: Register `WagoProvider` in `NotificationModule`**

Use:

```ts
WagoProvider,
{ provide: NOTIFICATION_CHANNEL, useExisting: WagoProvider },
```

Remove `WhaApiProvider` imports/provider registration.

- [ ] **Step 6: Run focused provider tests and confirm GREEN**

Expected: transport, auth, payload, normalization, timeout, duplicate, and error mapping all pass.

- [ ] **Step 7: Commit**

```bash
git add server/src/modules/notifications/reminders/providers server/src/modules/notifications/reminders/notification.module.ts
git commit -m "refactor(notifications): replace WhaAPI provider with Wago"
```

---

### Task 3: Reminder idempotency wiring

**Files:**
- Modify: `server/src/modules/notifications/reminders/notification-reminder.types.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder.repository.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts`

**Interfaces:**
- `ClaimedNotificationReminder.lastSentAt: Date | null`.
- Worker sends `options.idempotencyKey` to `NotificationChannel.send`.

- [ ] **Step 1: Write failing worker tests for idempotency**

For an unsent reminder expect:

```ts
expect(channel.send).toHaveBeenCalledWith(
  reminder.destination,
  expect.any(String),
  { idempotencyKey: `sopflow-reminder:${reminder.notificationReminderId}:initial` },
);
```

For a reminder with `lastSentAt = new Date('2026-08-11T00:00:00.000Z')`, expect the suffix to be `lastSentAt.getTime()`.

Add a retry test proving an unchanged `lastSentAt` produces the same key on repeated attempts.

- [ ] **Step 2: Run focused worker tests and confirm RED**

Expected: current channel call has only destination and message, and reminder data lacks `lastSentAt`.

- [ ] **Step 3: Expose `lastSentAt` from repository and type**

Add `lastSentAt` to the `pengingatWhatsApp` select in `findClaimed` and map it into `ClaimedNotificationReminder`.

- [ ] **Step 4: Add a private key builder to the worker**

```ts
private buildIdempotencyKey(reminder: ClaimedNotificationReminder): string {
  const occurrence = reminder.lastSentAt?.getTime().toString() ?? 'initial';
  return `sopflow-reminder:${reminder.notificationReminderId}:${occurrence}`;
}
```

Call:

```ts
await this.channel.send(reminder.destination, message.body, {
  idempotencyKey: this.buildIdempotencyKey(reminder),
});
```

- [ ] **Step 5: Run worker/repository focused tests and confirm GREEN**

Expected: same logical occurrence reuses key; later occurrence after updated `lastSentAt` gets a new key.

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/notifications/reminders/notification-reminder.types.ts server/src/modules/notifications/reminders/notification-reminder.repository.ts server/src/modules/notifications/reminders/push-reminder-worker.service.ts server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts
git commit -m "feat(notifications): add Wago reminder idempotency"
```

---

### Task 4: Scheduler activation and retry semantics

**Files:**
- Modify: `server/src/modules/notifications/reminders/notification-reminder-scheduler.service.ts`
- Modify: `server/src/modules/notifications/reminders/notification-reminder-scheduler.service.spec.ts`
- Modify: `server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts` if retry expectations need provider-code coverage

**Interfaces:**
- Scheduler activation is `WAGO_BASE_URL` + `WAGO_API_KEY`.
- `BAD_RECIPIENT` keeps the existing reminder-interval retry behavior.

- [ ] **Step 1: Write failing scheduler tests**

Cover:

```text
empty WAGO pair -> worker disabled
complete WAGO pair -> worker enabled
```

Startup validation already prevents partial pairs.

- [ ] **Step 2: Run scheduler tests and confirm RED**

Expected: scheduler still inspects WhaAPI token/channel.

- [ ] **Step 3: Replace scheduler activation logic**

Use:

```ts
const wagoBaseUrl = config.get<string>('WAGO_BASE_URL', '').trim();
const wagoApiKey = config.get<string>('WAGO_API_KEY', '').trim();
this.whatsappEnabled = wagoBaseUrl !== '' && wagoApiKey !== '';
```

- [ ] **Step 4: Confirm `BAD_RECIPIENT` retry remains reminder-interval based**

Do not turn manual-allow failures into permanent deletion. Existing worker behavior should remain:

```ts
if (error.kind === 'BAD_RECIPIENT') {
  return new Date(now.getTime() + this.reminderIntervalMs);
}
```

- [ ] **Step 5: Run scheduler/worker tests and confirm GREEN**

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/notifications/reminders/notification-reminder-scheduler.service.ts server/src/modules/notifications/reminders/notification-reminder-scheduler.service.spec.ts server/src/modules/notifications/reminders/push-reminder-worker.service.spec.ts
git commit -m "refactor(notifications): activate reminders from Wago config"
```

---

### Task 5: Documentation and legacy reference cleanup

**Files:**
- Modify: `README.md`
- Modify: docs files returned by repository search for `WHAAPI`, `WhaAPI`, `WhaApiProvider`, `whaapi.flobaze.com`
- Modify: design/plan docs only if implementation names differ from the approved contract

**Interfaces:**
- Deployment docs must describe manual Wago recipient allowlisting and `WAGO_*` configuration.

- [ ] **Step 1: Search repository for stale provider references**

Search exact terms:

```text
WHAAPI_
WhaAPI
WhaApiProvider
whaapi.flobaze.com
WHATSAPP_ALLOWED_RECIPIENTS
```

- [ ] **Step 2: Replace active documentation**

Document the operational flow:

```text
1. Host Wago.
2. Pair sender WhatsApp account.
3. Manually allow receiver numbers in Wago.
4. Set WAGO_BASE_URL and WAGO_API_KEY in SOPFlow.
5. SOPFlow sends reminders via POST /messages/send.
```

Do not imply SOPFlow auto-allows recipients.

- [ ] **Step 3: Re-run repository search**

Expected: no stale WhaAPI references remain in active code/docs, except historical migration/commit-context text if intentionally preserved and clearly historical.

- [ ] **Step 4: Commit**

```bash
git add README.md docs .env.example compose.yml server
git commit -m "docs: document self-hosted Wago notifications"
```

---

### Task 6: Full verification and integration

**Files:**
- No product-code changes unless verification exposes a defect directly caused by this refactor.

**Interfaces:**
- Final branch should be mergeable into `cleanup/legacy-code-docs` without weakening CI.

- [ ] **Step 1: Run server quality gates**

Run the repository's server typecheck, lint, Jest suite, and build commands. Expected: all pass.

- [ ] **Step 2: Run client quality gates affected by shared CI**

Run client typecheck/lint/unit/build or let GitHub CI execute the exact configured gates. Expected: no regressions from server-only refactor.

- [ ] **Step 3: Run repository CI / inspect GitHub Actions**

Expected: Wago-related quality jobs green. If the known J04 critical E2E failure remains, document it unchanged; do not weaken the assertion or retry logic.

- [ ] **Step 4: Create a PR from `refactor-wago-notification-provider` to `cleanup/legacy-code-docs`**

PR body must summarize configuration migration, manual allowlist semantics, idempotency, error mapping, and test evidence.

- [ ] **Step 5: Merge only after Wago-specific quality gates are green**

Merge the Wago PR into `cleanup/legacy-code-docs`. Do not merge the cleanup stack into `main` while its unrelated blocking J04 gate remains red unless the user explicitly accepts that risk later.
