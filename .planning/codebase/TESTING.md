# Testing Strategy

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/qa.md` — Testing strategy dan quality assurance guidance

## Skills Reference

Testing strategy mengikuti guidance dari `.skills/qa.md`:

```markdown
# Dari .skills/qa.md

Testing Pyramid:
- 70% Unit Tests
- 20% Integration Tests
- 10% E2E Tests

Coverage Targets:
- Domain logic: 100%
- Service layer: 80%
- Controllers: 70%
- Components: Critical paths only
```

**Skill Usage:**
- Gunakan `.skills/qa.md` untuk menentukan testing strategy
- Gunakan `.skills/backend.md` untuk spec-driven API testing
- Gunakan `.skills/database.md` untuk constraint dan invariant testing

---

## Testing Pyramid

```
        /\
       /  \
      / E2E \      (10%) - End-to-End tests
     /______\
    /        \
   / Integration \   (20%) - Integration tests
  /______________\
 /                \
/    Unit Tests    \  (70%) - Unit tests
/__________________\
```

---

## Server Testing (Jest)

### Unit Tests

**Coverage Target:** 70% dari total codebase

**Test Files:** `*.spec.ts` co-located dengan source files

**Patterns:**

#### Service Layer Tests
```typescript
// src/modules/sop/service/sop.service.spec.ts
describe('SopService', () => {
  let service: SopService;
  let repository: MockType<SopRepository>;
  
  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new SopService(repository as any);
  });
  
  describe('createDetailSop', () => {
    it('should create DetailSOP with status DRAFT successfully', async () => {
      // Arrange
      const dto: CreateDetailSopDto = {
        sopId: 'sop-123',
        judul: 'SOP Test',
        status: 'DRAFT',
      };
      repository.create.mockResolvedValue({ id: 'detail-1', ...dto });
      
      // Act
      const result = await service.createDetailSop(dto);
      
      // Assert
      expect(result.status).toBe('DRAFT');
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
    
    it('should throw ConflictException when creating BERLAKU DetailSOP for SOP that already has BERLAKU', async () => {
      // Arrange
      const dto: CreateDetailSopDto = {
        sopId: 'sop-123',
        status: 'BERLAKU',
      };
      repository.findBerlakuBySopId.mockResolvedValue({ id: 'existing-1' });
      
      // Act & Assert
      await expect(service.createDetailSop(dto))
        .rejects
        .toThrow(ConflictException);
    });
    
    it('should enforce constraint [P0-D]: invalid status transition', async () => {
      // Arrange
      const existingSop = { id: 'detail-1', status: 'DRAFT' };
      repository.findOne.mockResolvedValue(existingSop);
      
      // Act & Assert
      await expect(service.updateStatus('detail-1', 'BERLAKU'))
        .rejects
        .toThrow(BadRequestException);
      await expect(service.updateStatus('detail-1', 'BERLAKU'))
        .rejects
        .toThrow('Invalid transition: DRAFT → BERLAKU');
    });
  });
});
```

#### Repository Tests
```typescript
// src/modules/opd/repository/opd.repository.spec.ts
describe('OpdRepository', () => {
  let repository: OpdRepository;
  let prisma: MockType<PrismaService>;
  
  beforeEach(() => {
    prisma = {
      oPD: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new OpdRepository(prisma as any);
  });
  
  describe('delete', () => {
    it('should soft-delete OPD when no children exist', async () => {
      // Arrange
      prisma.oPD.findUnique.mockResolvedValue({
        id: 1,
        _count: { sop: 0, pengguna: 0 },
      });
      
      // Act
      const result = await repository.delete(1);
      
      // Assert
      expect(result.deletedAt).toBeDefined();
      expect(prisma.oPD.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });
    
    it('should throw ConflictException when OPD has children', async () => {
      // Arrange
      prisma.oPD.findUnique.mockResolvedValue({
        id: 1,
        _count: { sop: 5, pengguna: 2 },
      });
      
      // Act & Assert
      await expect(repository.delete(1))
        .rejects
        .toThrow(ConflictException);
      await expect(repository.delete(1))
        .rejects
        .toThrow('OPD tidak bisa dihapus karena masih memiliki 7 child entities');
    });
  });
});
```

#### Constraint Enforcement Tests
```typescript
// src/modules/evaluasi/service/pengajuan-evaluasi.service.spec.ts
describe('PengajuanEvaluasiService', () => {
  describe('create', () => {
    it('should enforce constraint [P0-C]: max 1 active pengajuan per OPD per jenis', async () => {
      // Arrange
      const dto: CreatePengajuanEvaluasiDto = {
        opdId: 1,
        jenis: 'TERJADWAL',
        sopDetailIds: ['sop-1', 'sop-2'],
      };
      repository.findActivePengajuan.mockResolvedValue({ id: 'existing-1' });
      
      // Act & Assert
      await expect(service.create(dto))
        .rejects
        .toThrow(ConflictException);
      await expect(service.create(dto))
        .rejects
        .toThrow('OPD ini sudah memiliki pengajuan evaluasi TERJADWAL aktif');
    });
    
    it('should use SELECT FOR UPDATE to prevent race condition', async () => {
      // Arrange
      const dto: CreatePengajuanEvaluasiDto = { /* ... */ };
      repository.findActivePengajuan.mockResolvedValue(null);
      
      // Act
      await service.create(dto);
      
      // Assert
      expect(repository.findActivePengajuan).toHaveBeenCalledWith(
        dto.opdId,
        dto.jenis,
        { forUpdate: true } // SELECT FOR UPDATE flag
      );
    });
  });
});
```

### Integration Tests

**Coverage Target:** Critical user journeys

**Test Files:** `*.e2e-spec.ts` in `test/` directory

**Patterns:**

#### Module Integration Tests
```typescript
// test/sop.e2e-spec.ts
describe('/api/v1/sop (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdSopId: string;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [SopModule, AuthModule, PrismaModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Login untuk dapat token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'tim-penyusun@example.com', password: 'password123' });
    
    authToken = loginResponse.body.access_token;
  });
  
  it('POST /sop should create new SOP', () => {
    return request(app.getHttpServer())
      .post('/api/v1/sop')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        judul: 'SOP Test E2E',
        nomorSop: 'SOP/TEST/2026/001',
      })
      .expect(201)
      .then(({ body }) => {
        createdSopId = body.id;
        expect(body.judul).toBe('SOP Test E2E');
        expect(body.status).toBe('DRAFT');
      });
  });
  
  it('GET /sop/:id should return SOP detail', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/sop/${createdSopId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(createdSopId);
      });
  });
  
  it('PUT /sop/:id/status should update status with valid transition', () => {
    return request(app.getHttpServer())
      .put(`/api/v1/sop/${createdSopId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'SEDANG_DISUSUN' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('SEDANG_DISUSUN');
      });
  });
  
  it('PUT /sop/:id/status should return 400 for invalid transition', () => {
    return request(app.getHttpServer())
      .put(`/api/v1/sop/${createdSopId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'BERLAKU' }) // Invalid: SEDANG_DISUSUN → BERLAKU
      .expect(400);
  });
  
  afterAll(async () => {
    await app.close();
  });
});
```

#### Constraint Integration Tests
```typescript
// test/evaluasi.e2e-spec.ts
describe('/api/v1/evaluasi (e2e)', () => {
  it('should enforce optimistic locking on NilaiEvaluasi update', async () => {
    // Setup: Create pengajuan and get nilaiEvaluasiId
    const nilaiEvaluasi = await createNilaiEvaluasi();
    
    // First update (version 1 → 2)
    const response1 = await request(app.getHttpServer())
      .put(`/api/v1/nilai-evaluasi/${nilaiEvaluasi.id}`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({
        hasil: 'SESUAI',
        version: 1, // Current version
      })
      .expect(200);
    
    expect(response1.body.version).toBe(2);
    
    // Second update with stale version (should fail)
    return request(app.getHttpServer())
      .put(`/api/v1/nilai-evaluasi/${nilaiEvaluasi.id}`)
      .set('Authorization', `Bearer ${evaluatorToken}`)
      .send({
        hasil: 'TIDAK_SESUAI',
        version: 1, // Stale version
      })
      .expect(409)
      .expect(({ body }) => {
        expect(body.code).toBe('OPTIMISTIC_LOCKING_CONFLICT');
        expect(body.currentVersion).toBe(2);
      });
  });
});
```

---

## Client Testing (Vitest + Testing Library)

### Unit Tests (Domain Functions)

**Coverage Target:** 100% untuk domain logic

**Test Files:** `*.test.ts` in `src/lib/domain/`

**Patterns:**

```typescript
// src/lib/domain/__tests__/sop.test.ts
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

// src/lib/domain/__tests__/evaluasi.test.ts
describe('canSubmitEvaluasi', () => {
  it('should return true when pengajuan status is SEDANG_DIEVALUASI', () => {
    expect(canSubmitEvaluasi('SEDANG_DIEVALUASI')).toBe(true);
  });
  
  it('should return false when pengajuan status is SELESAI_DIEVALUASI', () => {
    expect(canSubmitEvaluasi('SELESAI_DIEVALUASI')).toBe(false);
  });
});
```

### Component Tests

**Coverage Target:** Critical UI components

**Test Files:** `*.test.tsx` in `src/components/`

**Patterns:**

```typescript
// src/components/sop/__tests__/sop-card.test.tsx
describe('SopCard', () => {
  it('should render SOP title and status badge', () => {
    const sop = mockSopWithDetail({
      judul: 'Test SOP',
      detail: { status: 'DRAFT' },
    });
    
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Test SOP')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });
  
  it('should show edit button for Tim Penyusun with DRAFT status', () => {
    const sop = mockSopWithDetail({ status: 'DRAFT' });
    mockAuth({ role: 'tim-penyusun' });
    
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
  
  it('should hide edit button for SEDANG_DIEVALUASI status', () => {
    const sop = mockSopWithDetail({ status: 'SEDANG_DIEVALUASI' });
    mockAuth({ role: 'tim-penyusun' });
    
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
```

### Hook Tests

**Coverage Target:** All custom hooks

**Test Files:** `*.test.ts` in `src/hooks/`

**Patterns:**

```typescript
// src/hooks/__tests__/use-sop.test.ts
describe('useSop', () => {
  it('should fetch SOPs from API on mount', async () => {
    server.use(
      rest.get('/api/v1/sop', (req, res, ctx) => {
        return res(ctx.json(mockSops));
      })
    );
    
    const { result } = renderHook(() => useSop());
    
    await waitFor(() => {
      expect(result.current.sops).toHaveLength(3);
    });
  });
  
  it('should handle API error gracefully', async () => {
    server.use(
      rest.get('/api/v1/sop', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    const { result } = renderHook(() => useSop());
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

---

## Constraint Testing Matrix

| Constraint | Test Type | Test File | Status |
|------------|-----------|-----------|--------|
| [P2-D] 1 KEPALA_OPD per OPD | Unit | `auth.service.spec.ts` | Pending |
| [P2-D] 1 KOORDINATOR per OPD | Unit | `tim-penyusun.service.spec.ts` | Pending |
| [P0-C] Max 1 pengajuan aktif | Integration | `evaluasi.e2e-spec.ts` | Pending |
| [P0-B] 1 BERLAKU per SOP | Unit | `sop.service.spec.ts` | Pending |
| [P0-E] Optimistic locking | Integration | `evaluasi.e2e-spec.ts` | Pending |
| [P1-A] XOR RiwayatTandaTangan | Unit | `tte.service.spec.ts` | Pending |
| [P1-F] AKTIF ↔ berakhirPada | Unit | `tim-penyusun.service.spec.ts` | Pending |
| [P0-D] Valid status transitions | Unit | `sop.service.spec.ts` | Pending |
| [P1-B] TERJADWAL wajib nilaiOPD | Unit | `evaluasi.service.spec.ts` | Pending |
| [P2-F] Peraturan DICABUT tidak jadi DasarHukum | Integration | `peraturan.e2e-spec.ts` | Pending |

---

## Test Commands

### Server
```bash
# Unit tests
pnpm test

# Unit tests (watch mode)
pnpm test:watch

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:cov
```

### Client
```bash
# Unit tests
pnpm test

# Unit tests (watch mode)
pnpm test:watch

# Coverage report
pnpm test:cov
```

---

## Test Data Management

### Server Test Fixtures
```typescript
// server/test/fixtures/sop.fixture.ts
export function createSopFixture(overrides?: Partial<SOP>): SOP {
  return {
    id: uuid(),
    judul: 'SOP Test',
    nomorSop: 'SOP/TEST/2026/001',
    opdId: 1,
    ...overrides,
  };
}

export function createDetailSopFixture(overrides?: Partial<DetailSOP>): DetailSOP {
  return {
    id: uuid(),
    sopId: 'sop-123',
    status: 'DRAFT',
    versi: 1,
    ...overrides,
  };
}
```

### Client Test Mocks
```typescript
// client/src/test/mocks/sop.mock.ts
export function mockSopWithDetail(overrides?: Partial<SopWithDetail>): SopWithDetail {
  return {
    id: 'sop-1',
    judul: 'SOP Test',
    nomorSop: 'SOP/TEST/2026/001',
    detail: {
      id: 'detail-1',
      status: 'DRAFT',
      versi: 1,
    },
    opd: {
      id: 1,
      nama: 'OPD Test',
    },
    ...overrides,
  };
}
```

---

## Continuous Integration (Future)

```yaml
# .github/workflows/ci.yml (to be implemented)
name: CI

on: [push, pull_request]

jobs:
  test-server:
    runs-on: ubuntu-latest
    services:
      mariadb:
        image: mariadb:10
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: test_sop
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
        working-directory: server
      - run: pnpm test
        working-directory: server
      - run: pnpm test:e2e
        working-directory: server
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/test_sop
  
  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
        working-directory: client
      - run: pnpm test
        working-directory: client
```

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
