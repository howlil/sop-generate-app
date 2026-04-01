# Quick Task: Security Critical Fixes - Code Review Follow-up

**Created:** 2026-04-02
**Priority:** CRITICAL
**Source:** Comprehensive code review (server/)

## Objective

Fix critical security vulnerabilities identified in code review before production deployment:
1. JWT secret fallback vulnerability
2. Missing rate limiting
3. Input sanitization
4. Inconsistent transaction usage
5. Error message consistency

## Scope

**Files to modify:**
- `server/src/common/strategy/jwt.strategy.ts`
- `server/src/modules/auth/auth.module.ts`
- `server/src/main.ts`
- `server/src/config/env.validation.ts`
- `server/src/modules/evaluasi/service/evaluasi.service.ts`
- `server/package.json`

**Out of scope:**
- Unit tests (separate task)
- Performance optimizations
- Documentation updates

## Tasks

### Task 1: Fix JWT Secret Fallback (CRITICAL)
**File:** `server/src/common/strategy/jwt.strategy.ts`, `server/src/modules/auth/auth.module.ts`
**Change:** Remove default fallback, throw error if missing
**Risk:** High - security vulnerability

### Task 2: Add Rate Limiting (CRITICAL)
**File:** `server/package.json`, `server/src/main.ts`
**Change:** Install @nestjs/throttler, configure rate limiting on auth endpoints
**Risk:** High - brute force vulnerability

### Task 3: Add Input Sanitization (HIGH)
**File:** `server/src/main.ts`
**Change:** Add sanitization pipe or class-sanitizer
**Risk:** Medium - XSS vulnerability

### Task 4: Fix Error Message Consistency (MEDIUM)
**File:** `server/src/modules/evaluasi/service/evaluasi.service.ts`
**Change:** Use centralized message constants
**Risk:** Low - maintainability

### Task 5: Add Error Boundaries (MEDIUM)
**File:** `server/src/main.ts`
**Change:** Add unhandled promise rejection handlers
**Risk:** Low - reliability

## Acceptance Criteria

- [ ] JWT_SECRET required - app fails to start without it
- [ ] Rate limiting active (10 requests/hour on /login)
- [ ] Input sanitization configured
- [ ] All error messages use centralized constants
- [ ] Unhandled exception handlers installed
- [ ] All changes committed atomically
- [ ] STATE.md updated

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking change: JWT_SECRET required | Update .env.example, document in PR |
| Rate limiting may affect testing | Configure higher limits for test env |
| Sanitization may break valid input | Test with real data before deploy |

## Decisions

_None yet - will be filled during execution_

---
*Quick task created: 2026-04-02*
