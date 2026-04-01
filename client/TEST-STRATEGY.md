# Test Strategy — SOP Biro Organisasi Client

**Date:** 2026-04-02
**QA Engineer:** AI Agent (Senior QA Specialist)
**Application Type:** Government Web Application
**Tech Stack:** React 19 + TanStack Router + TanStack Query + Zustand + Vitest

---

## EXECUTIVE SUMMARY

### Current State
- **Existing Tests:** 0 (0% coverage)
- **Test Framework:** Vitest 3.x (configured, not used)
- **CI/CD Pipeline:** Not configured
- **Critical Bug Escape Rate:** Unknown (no tests)

### Target State
- **Coverage:** > 80% overall
- **Critical Flows:** 100% tested
- **Test Execution Time:** < 5 minutes
- **Flaky Test Rate:** < 1%

---

## TEST PYRAMID STRATEGY

```
        E2E Tests (10%) — 15 tests
     Integration Tests (20%) — 30 tests
   Unit Tests (70%) — 105 tests
   ────────────────────────────────
   TOTAL: ~150 tests
```

### Test Distribution by Layer

| Layer | Test Type | Tool | Target Coverage | Test Count |
|-------|-----------|------|-----------------|------------|
| **Domain Logic** | Unit | Vitest | 100% | 40 tests |
| **Services/API** | Unit + Integration | Vitest + MSW | 90% | 35 tests |
| **Hooks** | Unit + Integration | Vitest + Testing Library | 90% | 25 tests |
| **Components** | Unit | Vitest + Testing Library | 70% | 35 tests |
| **E2E Flows** | E2E | Playwright | Critical only | 15 tests |

---

## CRITICAL FLOWS (Priority 1)

### Flow 1: Tim Penyusun — Create & Submit SOP
**Test Priority:** P0 (Must test)
**Test Types:** Unit + Integration + E2E

**Steps:**
1. Login as Tim Penyusun
2. Create new SOP (DRAFT)
3. Edit metadata
4. Add procedure steps
5. Add pelaksana (swimlane)
6. Submit for evaluation (SIAP_DIEVALUASI)

**Test Cases:**
- ✅ Create SOP with valid data
- ✅ Edit metadata with valid data
- ✅ Add procedure steps with DECISION type
- ✅ Assign pelaksana to steps
- ✅ Submit SOP changes status correctly
- ❌ Cannot submit with incomplete steps
- ❌ Cannot edit SOP after submission

---

### Flow 2: Biro Organisasi — Create Evaluation & Assign
**Test Priority:** P0
**Test Types:** Unit + Integration + E2E

**Steps:**
1. Login as Biro Organisasi
2. Create PengajuanEvaluasi (TERJADWAL)
3. Select multiple SOPs from different OPDs
4. Assign to evaluator pool
5. Track evaluation progress

**Test Cases:**
- ✅ Create evaluation with valid SOPs
- ✅ Cannot create duplicate evaluation for same OPD
- ✅ Evaluation status updates correctly
- ✅ SOP status changes to SEDANG_DIEVALUASI

---

### Flow 3: Tim Evaluasi — Evaluate SOP
**Test Priority:** P0
**Test Types:** Unit + Integration + E2E

**Steps:**
1. Login as Tim Evaluasi
2. View assigned evaluations
3. Fill evaluation results (SESUAI/TIDAK_SESUAI)
4. Add notes per SOP
5. Submit evaluation results

**Test Cases:**
- ✅ View evaluation list
- ✅ Fill evaluation with SESUAI result
- ✅ Fill evaluation with TIDAK_SESUAI result + notes
- ✅ Submit evaluation changes status
- ❌ Cannot submit with incomplete evaluations
- ❌ TERJADWAL requires nilaiOPD

---

### Flow 4: TTE Workflow — BA & SOP Signing
**Test Priority:** P0
**Test Types:** Integration + E2E

**Steps:**
1. Biro Organisasi TTD BA (PIN verification)
2. Koordinator TTD BA (PIN verification)
3. Kepala OPD TTD per SOP (PIN verification)
4. SOP status → BERLAKU

**Test Cases:**
- ✅ Biro can TTD BA after evaluation complete
- ✅ Koordinator can TTD BA after Biro
- ✅ Kepala OPD can TTD SOP after BA complete
- ✅ SOP status changes to BERLAKU after TTE
- ❌ Cannot TTD without email verification
- ❌ Cannot TTD with wrong PIN

---

## UNIT TEST PLAN

### 1. Domain Logic Tests (40 tests)

**Files to Test:**
```
src/lib/domain/ (deprecated — move to utils/)
src/utils/ (domain logic should go here)
```

**Test Structure:**
```typescript
// src/lib/domain/__tests__/sop-status.test.ts
import { canEditSop, canSubmitEvaluasi, SOP_STATUS_TRANSITIONS } from '../sop-status';

describe('canEditSop', () => {
  it('should return true for DRAFT status', () => {
    expect(canEditSop('DRAFT', 'tim-penyusun')).toBe(true);
  });

  it('should return true for SEDANG_DISUSUN status', () => {
    expect(canEditSop('SEDANG_DISUSUN', 'tim-penyusun')).toBe(true);
  });

  it('should return true for REVISI_DARI_TIM_EVALUASI status', () => {
    expect(canEditSop('REVISI_DARI_TIM_EVALUASI', 'tim-penyusun')).toBe(true);
  });

  it('should return false for DIAJUKAN_EVALUASI status', () => {
    expect(canEditSop('DIAJUKAN_EVALUASI', 'tim-penyusun')).toBe(false);
  });

  it('should return false for SEDANG_DIEVALUASI status', () => {
    expect(canEditSop('SEDANG_DIEVALUASI', 'tim-penyusun')).toBe(false);
  });

  it('should return false for non-tim-penyusun role', () => {
    expect(canEditSop('DRAFT', 'biro-organisasi')).toBe(false);
  });
});

describe('SOP_STATUS_TRANSITIONS', () => {
  it('should allow DRAFT → SEDANG_DISUSUN', () => {
    expect(SOP_STATUS_TRANSITIONS['DRAFT']).toContain('SEDANG_DISUSUN');
  });

  it('should not allow DRAFT → BERLAKU', () => {
    expect(SOP_STATUS_TRANSITIONS['DRAFT']).not.toContain('BERLAKU');
  });

  it('should have BERLAKU and DICABUT as terminal states', () => {
    expect(SOP_STATUS_TRANSITIONS['BERLAKU']).toEqual([]);
    expect(SOP_STATUS_TRANSITIONS['DICABUT']).toEqual([]);
  });
});
```

---

### 2. Custom Hook Tests (25 tests)

**Files to Test:**
```
src/hooks/useSop.ts
src/hooks/useEvaluasi.ts
src/hooks/useTTE.ts
src/hooks/useAuth.ts
src/hooks/useOpd.ts
src/hooks/usePeraturan.ts
```

**Test Structure:**
```typescript
// src/hooks/__tests__/useSop.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSop } from '../useSop';
import { server } from '@/test/mocks/server';
import { rest } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSop', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('query', () => {
    it('should fetch SOP list successfully', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/sop', (req, res, ctx) => {
          return res(ctx.json([{ id: '1', judul: 'SOP Test' }]));
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.list).toHaveLength(1);
      expect(result.current.list[0].judul).toBe('SOP Test');
    });

    it('should handle API error', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/sop', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('mutation', () => {
    it('should create SOP successfully', async () => {
      server.use(
        rest.post('http://localhost:3000/api/v1/sop', (req, res, ctx) => {
          return res(ctx.status(201), ctx.json({
            id: '1',
            judul: 'SOP Created',
            status: 'DRAFT',
          }));
        })
      );

      const { result } = renderHook(() => useSop(), { wrapper: createWrapper() });

      await result.current.create({ judul: 'SOP Created', opdId: '1' });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should invalidate query on create success', async () => {
      // Test implementation
    });
  });
});
```

---

### 3. Component Tests (35 tests)

**Files to Test:**
```
src/components/sop/SopCard.tsx
src/components/sop/StatusBadge.tsx
src/components/evaluasi/StatusHasilEvaluasiPicker.tsx
src/components/tte/TTESignatureBlock.tsx
src/components/ui/*.tsx
```

**Test Structure:**
```typescript
// src/components/sop/__tests__/sop-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SopCard } from '../sop-card';
import { mockSop } from '@/test/mocks/sop';

describe('SopCard', () => {
  it('should render SOP title and status badge', () => {
    const sop = mockSop({ judul: 'Test SOP', status: 'DRAFT' });
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Test SOP')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('should show edit button for Tim Penyusun with DRAFT status', () => {
    const sop = mockSop({ status: 'DRAFT' });
    vi.mocked(useAuth).mockReturnValue({ role: 'tim-penyusun' });

    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should hide edit button for SEDANG_DIEVALUASI status', () => {
    const sop = mockSop({ status: 'SEDANG_DIEVALUASI' });
    vi.mocked(useAuth).mockReturnValue({ role: 'tim-penyusun' });

    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const sop = mockSop({ status: 'DRAFT' });

    render(<SopCard sop={sop} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(sop.id);
  });
});
```

---

## INTEGRATION TEST PLAN

### API Integration Tests (30 tests)

**Setup:**
```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/sop', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', judul: 'SOP 1', status: 'DRAFT' },
      { id: '2', judul: 'SOP 2', status: 'BERLAKU' },
    ]));
  }),

  rest.post('/api/v1/sop', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      id: 'new-id',
      judul: req.body.judul,
      status: 'DRAFT',
    }));
  }),
];

export const server = setupServer(...handlers);

// Global test setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## E2E TEST PLAN (Playwright)

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### E2E Test Examples

```typescript
// tests/e2e/sop-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SOP Creation Workflow', () => {
  test('should complete SOP creation as Tim Penyusun', async ({ page }) => {
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
  });

  test('should edit SOP metadata', async ({ page }) => {
    // Login and navigate to SOP detail
    await page.goto('/tim-penyusun/detail-sop/1');

    // Edit metadata
    await page.click('button:has-text("Edit Metadata")');
    await page.fill('[name="institution"]', 'Organisasi Test');
    await page.fill('[name="picName"]', 'PIC Test');
    await page.click('button:has-text("Simpan Metadata")');

    // Verify update
    await expect(page.locator('text=Organisasi Test')).toBeVisible();
  });
});

// tests/e2e/evaluasi-workflow.spec.ts
test.describe('Evaluation Workflow', () => {
  test('should complete evaluation as Tim Evaluasi', async ({ page }) => {
    // Login as Tim Evaluasi
    await page.goto('/login');
    await page.fill('[name="email"]', 'evaluator@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // View evaluation list
    await expect(page.locator('text=Evaluasi SOP')).toBeVisible();

    // Fill evaluation
    await page.click('button:has-text("Isi Evaluasi")');
    await page.selectOption('[name="hasil"]', 'SESUAI');
    await page.fill('[name="catatan"]', 'SOP sudah sesuai standar');
    await page.click('button:has-text("Simpan")');

    // Submit evaluation
    await page.click('button:has-text("Selesai Evaluasi")');
    await page.click('button:has-text("Konfirmasi")');

    // Verify status change
    await expect(page.locator('text=SELESAI_DIEVALUASI')).toBeVisible();
  });
});

// tests/e2e/tte-workflow.spec.ts
test.describe('TTE Workflow', () => {
  test('should complete TTE signing for BA', async ({ page }) => {
    // Login as Biro Organisasi
    await page.goto('/login');
    await page.fill('[name="email"]', 'biro@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to TTE page
    await page.goto('/biro-organisasi/ttd-elektronik');

    // Sign BA
    await page.click('button:has-text("Tanda Tangan BA")');
    await page.fill('[name="pin"]', '123456');
    await page.click('button:has-text("Konfirmasi")');

    // Verify signature
    await expect(page.locator('text=DIVERIFIKASI_BIRO')).toBeVisible();
  });
});
```

---

## TEST INFRASTRUCTURE

### File Structure

```
client/
├── src/
│   ├── __tests__/              # Root test config
│   │   ├── setup.ts            # Test setup (globals, mocks)
│   │   └── teardown.ts         # Cleanup after tests
│   ├── lib/domain/__tests__/   # Domain logic tests
│   ├── hooks/__tests__/        # Hook tests
│   ├── components/__tests__/   # Component tests
│   ├── services/__tests__/     # Service/API tests
│   └── test/mocks/             # Test mocks & fixtures
│       ├── server.ts           # MSW server
│       ├── handlers/           # API handlers
│       └── data/               # Mock data factories
├── tests/
│   └── e2e/                    # Playwright E2E tests
│       ├── sop-workflow.spec.ts
│       ├── evaluasi-workflow.spec.ts
│       └── tte-workflow.spec.ts
├── vitest.config.ts            # Vitest configuration
└── playwright.config.ts        # Playwright configuration
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/__tests__/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Day 1-2)

**Tasks:**
1. ✅ Install test dependencies
2. ✅ Configure Vitest + Testing Library
3. ✅ Setup MSW for API mocking
4. ✅ Create test utilities & factories
5. ✅ Write first 10 domain logic tests

**Deliverables:**
- Test infrastructure ready
- 10 passing tests
- Coverage report baseline

---

### Phase 2: Hook Tests (Day 3-4)

**Tasks:**
1. Write tests for all custom hooks (25 tests)
2. Mock API responses with MSW
3. Test loading, error, success states
4. Test mutation invalidation

**Deliverables:**
- 25 hook tests passing
- 70% hook coverage

---

### Phase 3: Component Tests (Day 5-6)

**Tasks:**
1. Write tests for UI components (35 tests)
2. Test user interactions
3. Test accessibility (aria-labels)
4. Test responsive behavior

**Deliverables:**
- 35 component tests passing
- 70% component coverage

---

### Phase 4: E2E Tests (Day 7-8)

**Tasks:**
1. Setup Playwright
2. Write E2E tests for 6 critical flows (15 tests)
3. Configure CI/CD integration
4. Setup test database seeding

**Deliverables:**
- 15 E2E tests passing
- CI/CD pipeline configured
- < 10 minute execution time

---

### Phase 5: CI/CD Integration (Day 9)

**Tasks:**
1. Configure GitHub Actions / GitLab CI
2. Setup test reporting
3. Configure coverage thresholds
4. Add test status badges

**Deliverables:**
- Automated test pipeline
- Coverage reports
- Test result artifacts

---

## COVERAGE THRESHOLDS

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "src/lib/domain/": {
      "branches": 90,
      "functions": 95,
      "lines": 95,
      "statements": 95
    },
    "src/hooks/": {
      "branches": 80,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

---

## QUALITY METRICS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Overall Coverage** | > 80% | 0% | 🔴 |
| **Critical Flow Coverage** | 100% | 0% | 🔴 |
| **Test Count** | 150+ | 0 | 🔴 |
| **Test Execution Time** | < 5 min | N/A | - |
| **Flaky Test Rate** | < 1% | N/A | - |
| **Bug Escape Rate** | < 5% | Unknown | - |

---

## NEXT STEPS (Priority Order)

### P0 — CRITICAL (Day 1-2)
1. **Setup test infrastructure**
   - Install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw`
   - Configure: vitest.config.ts
   - Create: test mocks & utilities

2. **Write first 10 tests**
   - Domain logic: `canEditSop`, `canSubmitEvaluasi`
   - Hook: `useSop`, `useAuth`
   - Component: `SopCard`, `StatusBadge`

### P1 — HIGH (Day 3-5)
3. **Complete hook tests** (25 tests)
4. **Complete component tests** (35 tests)

### P2 — MEDIUM (Day 6-9)
5. **Write E2E tests** (15 tests)
6. **Setup CI/CD pipeline**

---

**Status:** Ready to execute
**Estimated Time:** 9 days
**Test Count Target:** 150 tests
**Coverage Target:** > 80%
