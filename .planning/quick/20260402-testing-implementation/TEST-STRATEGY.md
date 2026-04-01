# Test Strategy — Server SOP Biro Organisasi

**Created:** 2026-04-02
**Framework:** Jest 30.x + supertest
**Coverage Target:** > 80% overall, > 90% services

---

## QA Intake Checklist

- [x] Application type understood: Government (Biro Organisasi)
- [x] Tech stack identified: NestJS 11 + Prisma 7 + MariaDB
- [x] Critical user flows identified (see below)
- [x] Existing tests available: Yes (basic e2e test only)
- [ ] CI/CD pipeline configured: No
- [x] Test framework: Jest (already configured)
- [ ] Coverage requirements: Company standard (>80%)
- [ ] Performance requirements: Load testing not in scope
- [ ] Security requirements: OWASP basic compliance
- [ ] Compliance requirements: WCAG not applicable (backend)

---

## Critical User Flows

1. **Login & Authentication** — User login with email/password
2. **Create SOP** — Tim Penyusun creates new SOP with metadata
3. **Submit for Evaluation** — SOP workflow: DRAFT → SIAP_DIEVALUASI
4. **Evaluate SOP** — Tim Evaluasi fills evaluation results
5. **TTE Sign** — Electronic signature workflow

---

## Test Pyramid

```
        E2E Tests (10%) — 5 critical flows
     Integration Tests (20%) — API endpoints, repository
   Unit Tests (70%) — Services, DTOs, utilities
```

**Test Distribution:**

| Layer | Test Type | Target | Priority |
|-------|-----------|--------|----------|
| Auth Service | Unit | 90% | P0 |
| Users Service | Unit | 90% | P0 |
| SOP Service | Unit + Integration | 90% | P0 |
| Evaluasi Service | Unit + Integration | 90% | P0 |
| TTE Service | Unit | 80% | P1 |
| Controllers | Integration | 80% | P1 |
| Repositories | Integration | 90% | P1 |
| DTOs | Unit | 100% | P1 |
| Guards/Filters | Unit | 80% | P2 |

---

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Critical flows | 100% | 0% |
| Overall coverage | > 80% | < 10% |
| Services | > 90% | 0% |
| Controllers | > 80% | 0% |
| Repositories | > 90% | 0% |

---

## Performance Targets

| Suite | Target | Notes |
|-------|--------|-------|
| Unit tests | < 2 minutes | Parallel execution |
| Integration tests | < 3 minutes | Isolated test DB |
| E2E tests | < 5 minutes | Critical flows only |
| Total CI pipeline | < 10 minutes | With build & lint |

---

## Test Infrastructure

### Test Database
- Use MariaDB test database (separate from dev/prod)
- Migrate schema before tests
- Seed with test data
- Clean up after tests

### Mocking Strategy
- **External services:** Manual mocks (JWT, bcrypt)
- **Database:** Testcontainers (isolated DB)
- **Guards:** Mock user context
- **Config:** Override with test values

### Test Utilities
- Test user factory
- Test data cleanup
- Auth token helper
- API response matchers

---

## Test Organization

```
server/
├── test/
│   ├── setup.ts              # Global test setup
│   ├── testcontainers.ts     # Test DB management
│   ├── mocks/
│   │   ├── user.factory.ts   # Test user generator
│   │   ├── sop.factory.ts    # Test SOP generator
│   │   └── auth.mock.ts      # Auth mocks
│   └── e2e/
│       ├── auth.e2e-spec.ts
│       ├── sop.e2e-spec.ts
│       └── evaluasi.e2e-spec.ts
└── src/
    ├── modules/
    │   ├── auth/
    │   │   └── service/
    │   │       └── auth.service.spec.ts
    │   ├── users/
    │   │   └── service/
    │   │       └── users.service.spec.ts
    │   └── sop/
    │       └── service/
    │           └── sop.service.spec.ts
    └── common/
        ├── guards/
        │   └── jwt-auth.guard.spec.ts
        └── filters/
            └── http-exception.filter.spec.ts
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Test utilities and mocks
- [ ] Test database setup
- [ ] User factory
- [ ] Auth token helper

### Phase 2: Unit Tests (Day 2-3)
- [ ] Auth service tests
- [ ] Users service tests
- [ ] SOP service tests
- [ ] Evaluasi service tests
- [ ] DTO validation tests

### Phase 3: Integration Tests (Day 4-5)
- [ ] Auth API tests
- [ ] Users API tests
- [ ] SOP API tests
- [ ] Evaluasi API tests
- [ ] Repository tests

### Phase 4: E2E Tests (Day 6)
- [ ] Login flow
- [ ] SOP creation flow
- [ ] Evaluation flow
- [ ] TTE signing flow

### Phase 5: CI/CD & Coverage (Day 7)
- [ ] Coverage reporting
- [ ] GitHub Actions workflow
- [ ] Test optimization
- [ ] Documentation

---

## Test Naming Convention

```typescript
// Unit tests: *.spec.ts
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});

// Integration tests: *.e2e-spec.ts
describe('ControllerName (e2e)', () => {
  describe('HTTP_METHOD /endpoint', () => {
    it('should [expected behavior]', () => {
      // Test implementation
    });
  });
});
```

---

## Quality Gates

- **Build must pass** before running tests
- **Lint must pass** before committing
- **Coverage > 80%** for PR merge
- **No flaky tests** (retry limit: 0)
- **Test execution < 10 minutes** in CI

---

*Test strategy created: 2026-04-02*
