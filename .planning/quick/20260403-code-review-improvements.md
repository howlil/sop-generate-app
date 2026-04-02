# Quick Task: Code Review Improvements — Priority 1

**Created:** 2026-04-03
**Source:** Code review findings (2026-04-02-code-review)
**Goal:** Implement high-impact, low-effort security and quality improvements

---

## Tasks

### ✅ Task 1: Add Rate Limiting Differentiation (Priority 1 - High Impact, Low Effort)

**Issue:** Same rate limit for `/login` and `/sops` — brute force attacks still possible

**Implementation:**
- Configure separate throttler configs: strict for auth (5/min), relaxed for general API (100/hr)
- Apply strict limit to auth endpoints via `@SkipThrottle()` decorator pattern

**Files to modify:**
- `server/src/app.module.ts` — ThrottlerModule configuration
- `server/src/modules/auth/controller/auth.controller.ts` — Add throttle override

---

### ✅ Task 2: Implement Password Strength Validation (Priority 1 - Medium Impact, Low Effort)

**Issue:** No password policy enforcement in `changePassword`

**Implementation:**
- Create `PasswordValidator` utility class
- Add validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Apply to both login (initial password) and changePassword

**Files to create:**
- `server/src/common/validators/password.validator.ts`

**Files to modify:**
- `server/src/modules/auth/service/auth.service.ts`
- `server/src/modules/auth/dto/auth.dto.ts` — Add DTO validation

---

### ✅ Task 3: Replace Magic Numbers with Constants (Priority 2 - Low Impact, Low Effort)

**Issue:** Magic numbers in `main.ts` and `app.module.ts`

**Implementation:**
- Extract throttle TTL and limit to named constants
- Extract CORS maxAge to constant
- Extract JWT cookie maxAge to constant

**Files to modify:**
- `server/src/app.module.ts`
- `server/src/main.ts`

---

### ✅ Task 4: Remove DATABASE_URL from Env Validation (Priority 2 - Security)

**Issue:** DATABASE_URL contains password in plain text — risk of leaking in logs

**Implementation:**
- Remove DATABASE_URL from env validation schema (already using individual vars)
- Keep only: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME

**Files to modify:**
- `server/src/config/env.validation.ts`

---

## Acceptance Criteria

- [ ] Rate limiting: Auth endpoints limited to 5 requests/minute, general API 100/hour
- [ ] Password validation: Rejects weak passwords with clear error messages
- [ ] No magic numbers: All configuration values are named constants
- [ ] DATABASE_URL removed from validation schema
- [ ] All existing tests still pass
- [ ] No breaking changes to API contracts

---

## Out of Scope (Deferred to Future)

- Database constraint for single BERLAKU per SOP (requires migration + testing)
- Test coverage improvements (separate milestone)
- Pagination implementation (requires API contract changes)
- Authorization helper refactoring (larger refactor)
- Optimistic locking on DetailSOP (requires schema change)
- Audit logging for auth events (larger feature)

---

## Notes

Following EZ Agents quick mode:
- Atomic commits per task
- Updates to STATE.md "Quick Tasks Completed" table
- No discussion phase — requirements clear from code review
- No verification phase — tasks are straightforward
