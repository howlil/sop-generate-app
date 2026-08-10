# Minimal Production Env Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce production setup to five required environment values, with two additional WhatsApp credentials only when WhatsApp is used, while preserving secure per-user PDF signing.

**Architecture:** Keep deployment-specific secrets and the public origin external. Move stable database names, ports, feature toggles, timeouts, JWT durations, PDF metadata, storage paths, and scheduler tuning to application/Compose defaults. Keep `TTE_ENCRYPTION_SECRET` mandatory because it protects encrypted personal P12 passphrases; keep personal P12 data in MariaDB and signed PDFs in the existing Docker volume.

**Tech Stack:** NestJS, Zod, Docker Compose, MariaDB, Prisma, Jest.

## Global Constraints

- Production required env: `PUBLIC_APP_ORIGIN`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `TTE_ENCRYPTION_SECRET`.
- WhatsApp env when enabled: `WHAAPI_TOKEN`, `WHAAPI_CHANNEL_ID`.
- Never hardcode JWT, database, or TTE secrets.
- Preserve existing P12-per-user database storage and `sop_pdf_data` PDF persistence.
- Defaults must remain overridable inside backend code for tests, but not be exposed as required deployment knobs.

---

### Task 1: Make backend defaults authoritative

**Files:**
- Modify: `server/src/config/env.validation.ts`
- Test: `server/src/config/env.validation.spec.ts`

**Interfaces:**
- Consumes: process environment loaded by Nest ConfigModule.
- Produces: validated environment where stable runtime values have secure defaults and WhatsApp enablement is derived from credential presence.

- [ ] **Step 1: Add failing validation tests**

Add cases proving production succeeds with only the five required deployment values plus internal database values supplied by Compose, and that WhatsApp credentials are optional together but rejected when only one is supplied.

- [ ] **Step 2: Run focused env validation tests**

Run: `pnpm --dir server test -- env.validation.spec.ts --runInBand`
Expected: new tests fail before implementation.

- [ ] **Step 3: Implement minimal backend defaults**

Keep defaults for port, database port, JWT durations, Swagger behavior, storage, notification scheduling, PDF signing metadata, and WhatsApp tuning. Derive WhatsApp enabled state from presence of both `WHAAPI_TOKEN` and `WHAAPI_CHANNEL_ID`; reject half-configured credentials.

- [ ] **Step 4: Re-run focused tests**

Run: `pnpm --dir server test -- env.validation.spec.ts --runInBand`
Expected: PASS.

### Task 2: Minimize Compose and public env template

**Files:**
- Modify: `compose.yml`
- Modify: `.env.example`

**Interfaces:**
- Consumes: five required production values and optional WhatsApp credential pair.
- Produces: MariaDB/backend containers with internal defaults wired directly by Compose.

- [ ] **Step 1: Simplify MariaDB configuration**

Use `MARIADB_RANDOM_ROOT_PASSWORD=1`, default database `sop_biro_organisasi`, default app user `sop_app`, and require only `DB_PASSWORD` from the operator.

- [ ] **Step 2: Simplify backend environment mapping**

Set stable runtime values directly in Compose or rely on backend defaults. Set `ALLOWED_ORIGINS` from `PUBLIC_APP_ORIGIN`. Pass only secrets/origin and optional WhatsApp credentials from operator env.

- [ ] **Step 3: Replace `.env.example` with minimal deployment surface**

Document exactly five required keys and a clearly separated optional WhatsApp pair.

- [ ] **Step 4: Validate Compose rendering**

Run `docker compose --env-file <temporary-minimal-env> config` with only the five required values.
Expected: configuration renders without missing-variable errors.

### Task 3: Synchronize deployment documentation and verify

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: final Compose contract.
- Produces: deployment instructions matching actual runtime behavior.

- [ ] **Step 1: Update MyPaas documentation**

Document frontend internal port `8080`, the five required env values, optional WhatsApp credentials, MariaDB generated root password, personal P12 database storage, and signed-PDF volume persistence.

- [ ] **Step 2: Run backend unit/config checks**

Run: `pnpm --dir server test -- env.validation.spec.ts --runInBand`
Expected: PASS.

- [ ] **Step 3: Run server lint/type checks available in package scripts**

Run the repository's existing server quality command(s) from `server/package.json`.
Expected: PASS.

- [ ] **Step 4: Review final diff**

Confirm no production secret received a hardcoded value and no personal P12 storage behavior changed.
