---
name: qa-fyp
description: >
  Simplified testing strategy for final year project. Focus on critical flow testing with
  minimal overhead. Use this when: designing test strategy, writing critical flow tests,
  or pre-deployment validation. Triggers on: "test strategy FYP", "critical flow test",
  "pre-deployment testing".
---

# QA Engineer — FYP Simplified

**Mission:** Ensure 80% critical flow coverage with **minimal test overhead**.

**Time Budget:** 3-4 hours strategy + 15-20 hours implementation

---

## Process (3 Phases Only)

### Phase 1: Test Strategy Design (30 min)

**Test Pyramid for FYP:**

```
        E2E Tests (10%) — 3-5 critical flows only
     Integration Tests (30%) — API contract tests
   Unit Tests (60%) — Service logic + domain invariants
```

**Critical Flows to Test (100% Required):**

| # | Flow | Actor | Priority |
|---|------|-------|----------|
| 1 | Login → Create SOP → Submit Evaluation | Tim Penyusun | P0 |
| 2 | Login → Create Evaluation → Assign Evaluator | Biro Organisasi | P0 |
| 3 | Login → Evaluate SOP → Submit Results | Tim Evaluasi | P0 |
| 4 | Login → TTE Sign BA | Biro Organisasi | P0 |
| 5 | Login → Sahkan SOP | Kepala OPD | P0 |

**Coverage Targets:**

| Test Type | Target | Minimum |
|-----------|--------|---------|
| Critical flows | 100% | 100% |
| API endpoints | 80% | 70% |
| Service logic | 90% | 80% |
| Overall | 80% | 70% |

**Test Execution Time Targets:**

| Test Suite | Target | Maximum |
|------------|--------|---------|
| Unit tests | < 2 min | 5 min |
| Integration tests | < 3 min | 5 min |
| E2E tests | < 5 min | 10 min |
| Total CI pipeline | < 10 min | 20 min |

**Action Items:**
- [ ] Identify 5 critical flows
- [ ] Set coverage targets
- [ ] Configure test runner (Jest/Vitest)

---

### Phase 2: Test Implementation (per flow)

**Unit Test Template (Service Layer):**

```typescript
// src/modules/sop/service/sop.service.spec.ts
describe('SopService', () => {
  let service: SopService;
  let repository: MockType<SopRepository>;
  let prisma: MockType<PrismaService>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      findByNomor: jest.fn(),
    };
    prisma = { $transaction: jest.fn() };
    service = new SopService(repository as any, prisma as any);
  });

  describe('create', () => {
    const mockUser = { id: 'user-1', role: 'tim-penyusun', opdId: 1 };
    const createDto: CreateSopDto = {
      judul: 'SOP Test',
      nomorSop: 'SOP/TEST/2026/001',
      opdId: 1,
    };

    it('should create SOP successfully', async () => {
      repository.findByNomor.mockResolvedValue(null);
      repository.save.mockResolvedValue({
        id: 'sop-1',
        ...createDto,
        status: 'DRAFT',
      });

      const result = await service.create(createDto, mockUser);

      expect(result.judul).toBe('SOP Test');
      expect(result.status).toBe('DRAFT');
      expect(repository.findByNomor).toHaveBeenCalledWith(createDto.nomorSop);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate nomorSop', async () => {
      repository.findByNomor.mockResolvedValue({ id: 'existing-sop' });

      await expect(
        service.create(createDto, mockUser),
      ).rejects.toThrow(ConflictException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for wrong OPD', async () => {
      repository.findByNomor.mockResolvedValue(null);
      const wrongUser = { ...mockUser, opdId: 2 };

      await expect(
        service.create(createDto, wrongUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const mockSop = {
        id: 'sop-1',
        status: 'DRAFT',
        changeStatus: jest.fn(),
      };
      repository.findOne.mockResolvedValue(mockSop);
      repository.save.mockResolvedValue({ ...mockSop, status: 'SEDANG_DISUSUN' });

      const result = await service.updateStatus(
        'sop-1',
        'SEDANG_DISUSUN',
        mockUser,
      );

      expect(result.status).toBe('SEDANG_DISUSUN');
      expect(mockSop.changeStatus).toHaveBeenCalledWith('SEDANG_DISUSUN');
    });

    it('should throw for invalid status transition', async () => {
      const mockSop = {
        id: 'sop-1',
        status: 'DRAFT',
        changeStatus: jest.fn().mockImplementation(() => {
          throw new Error('Invalid transition: DRAFT → BERLAKU');
        }),
      };
      repository.findOne.mockResolvedValue(mockSop);

      await expect(
        service.updateStatus('sop-1', 'BERLAKU', mockUser),
      ).rejects.toThrow('Invalid transition');
    });
  });
});
```

**Integration Test Template (API Contract):**

```typescript
// src/modules/sop/sop.e2e-spec.ts
describe('POST /api/v1/sop', () => {
  it('should create SOP with valid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/sop')
      .set('Authorization', `Bearer ${timPenyusunToken}`)
      .send({
        judul: 'SOP Test',
        nomorSop: 'SOP/TEST/2026/001',
        opdId: 1,
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      judul: 'SOP Test',
      nomorSop: 'SOP/TEST/2026/001',
      status: 'DRAFT',
    });
  });

  it('should return 409 for duplicate nomorSop', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/sop')
      .set('Authorization', `Bearer ${timPenyusunToken}`)
      .send({
        judul: 'SOP Test 2',
        nomorSop: 'SOP/TEST/2026/001', // Duplicate
        opdId: 1,
      })
      .expect(409);

    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('should return 401 without auth token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/sop')
      .send({ judul: 'SOP Test', nomorSop: 'SOP/TEST/2026/002' })
      .expect(401);
  });

  it('should return 422 for invalid DTO', () => {
    return request(app.getHttpServer())
      .post('/api/v1/sop')
      .set('Authorization', `Bearer ${timPenyusunToken}`)
      .send({ judul: '' }) // Missing required
      .expect(422);
  });
});
```

**E2E Test Template (Critical Flow):**

```typescript
// tests/e2e/sop-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SOP Creation Flow', () => {
  test('should complete SOP creation and submission', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'tim-penyusun@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/tim-penyusun/daftar-sop');

    // Create SOP
    await page.click('button:has-text("Buat SOP Baru")');
    await page.fill('[name="judul"]', 'SOP E2E Test');
    await page.fill('[name="nomorSop"]', 'SOP/E2E/2026/001');
    await page.fill('[name="deskripsi"]', 'SOP untuk testing E2E');
    await page.click('button:has-text("Simpan")');

    // Verify SOP created
    await expect(page.locator('text=SOP E2E Test')).toBeVisible();
    await expect(page.locator('text=DRAFT')).toBeVisible();

    // Edit SOP Metadata
    await page.click('button:has-text("Edit Metadata")');
    await page.fill('[name="institution"]', 'Organisasi Test');
    await page.fill('[name="picName"]', 'PIC Test');
    await page.click('button:has-text("Simpan Metadata")');

    // Submit for Evaluation
    await page.click('button:has-text("Ajukan Evaluasi")');
    await page.click('button:has-text("Konfirmasi")');

    // Verify status changed
    await expect(page.locator('text=DIAJUKAN_EVALUASI')).toBeVisible();
  });
});
```

**Action Items:**
- [ ] Write unit tests for service layer
- [ ] Write integration tests for API endpoints
- [ ] Write E2E tests for critical flows
- [ ] Configure test coverage reporting

---

### Phase 3: Pre-Deployment Checklist (15 min)

**Test Execution Checklist:**

```
BEFORE DEPLOYMENT:
[ ] All unit tests pass (Jest/Vitest)
[ ] All integration tests pass (supertest)
[ ] All E2E tests pass (Playwright)
[ ] Coverage report generated
[ ] Critical flow coverage = 100%
[ ] No test failures in CI

COVERAGE REPORT:
[ ] Statements: > 80%
[ ] Branches: > 70%
[ ] Functions: > 80%
[ ] Lines: > 80%

CRITICAL FLOWS:
[ ] Flow 1: Login → Create SOP → Submit ✅
[ ] Flow 2: Create Evaluation → Assign Evaluator ✅
[ ] Flow 3: Evaluate SOP → Submit Results ✅
[ ] Flow 4: TTE Sign BA ✅
[ ] Flow 5: Sahkan SOP ✅
```

**Test Commands:**

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run E2E tests only
npm run test:e2e

# Run specific test file
npm run test -- sop.service.spec.ts

# Run in watch mode
npm run test:watch
```

**Action Items:**
- [ ] Run full test suite
- [ ] Verify coverage meets targets
- [ ] Fix any failing tests
- [ ] Document test results for thesis

---

## Output Contract

Generate test strategy in this format:

```markdown
===========================================
TEST STRATEGY (FYP SIMPLIFIED)
===========================================
Module: [module name]
Critical Flows: [list]

---
TEST PLAN
---
Unit Tests: [count]
Integration Tests: [count]
E2E Tests: [count]

---
UNIT TESTS
---
[Test examples for service layer]

---
INTEGRATION TESTS
---
[Test examples for API endpoints]

---
E2E TESTS
---
[Test examples for critical flows]

---
COVERAGE TARGETS
---
Statements: [target]%
Branches: [target]%
Functions: [target]%
Lines: [target]%

---
PRE-DEPLOYMENT CHECKLIST
---
[Checklist items]

===========================================
TEST QUALITY: HIGH / MEDIUM / LOW
Production Ready: YES / NO / NEEDS REVIEW
===========================================
```

---

## Trigger Conditions

Invoke this skill when:
- ✅ Designing test strategy for new module
- ✅ Writing critical flow tests
- ✅ Pre-deployment validation
- ✅ Thesis documentation (Bab Testing)

Do NOT invoke when:
- ❌ Need 100% coverage (overkill for FYP)
- ❌ Writing trivial tests (direct write faster)
- ❌ Testing utility functions (obvious behavior)

---

*Last updated: 2026-04-01 — FYP Simplified from qa-engineer.md*
