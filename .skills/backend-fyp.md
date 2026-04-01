---
name: backend-fyp
description: >
  Simplified backend implementation for final year project. Spec-driven NestJS development
  with minimal overhead. Use this when: implementing new API endpoints, NestJS module creation,
  or service layer design. Triggers on: "NestJS module", "API endpoint", "service layer",
  "backend implementation FYP".
---

# Backend Engineer — FYP Simplified

**Mission:** Implement NestJS APIs for 89 requirements with **minimal boilerplate**.

**Time Budget:** 3-4 hours spec + 20-25 hours implementation per module

---

## Process (3 Phases Only)

### Phase 1: API Spec (1 hour)

For each module (SOP, Evaluasi, TTE, OPD, Peraturan), define:

```yaml
# Template
[METHOD] /api/v1/[resource]
Auth: JWT (role: [required roles])
Request:
  [field]: [type] ([validation rules])
Response [2xx]:
  data: { [fields] }
Response [4xx/5xx]:
  error: { code: [CODE], message: "[message]" }
```

**Example Specs for SOP Module:**

```yaml
POST /api/v1/sop
Auth: JWT (role: tim-penyusun)
Request:
  judul: string (required, max 200)
  nomorSop: string (required, unique, format: SOP/XXX/YYYY/NNN)
  deskripsi: string (optional, max 1000)
  opdId: number (required, must match user's OPD)
Response 201:
  data:
    id: uuid
    judul: string
    nomorSop: string
    status: DRAFT
    createdAt: ISO8601
Response 409:
  error:
    code: CONFLICT
    message: "Nomor SOP sudah digunakan"
Response 403:
  error:
    code: FORBIDDEN
    message: "Tidak memiliki akses ke OPD ini"

---

GET /api/v1/sop/:id
Auth: JWT (role: tim-penyusun, biro-organisasi, kepala-opd, tim-evaluasi)
Response 200:
  data:
    id: uuid
    judul: string
    nomorSop: string
    status: StatusSOP
    opd: { id, nama }
    detailSops: [{ id, versi, status, createdAt }]
Response 404:
  error:
    code: NOT_FOUND
    message: "SOP tidak ditemukan"

---

PATCH /api/v1/sop/:id/status
Auth: JWT (role: tim-penyusun, biro-organisasi)
Request:
  status: StatusSOP (must be valid transition)
Response 200:
  data: { id, status, updatedAt }
Response 400:
  error:
    code: BAD_REQUEST
    message: "Transisi status tidak valid"
```

**Action Items:**
- [ ] Write spec for all endpoints in module
- [ ] Validate spec against requirements (REQUIREMENTS.md)
- [ ] Get spec review (optional but recommended)

---

### Phase 2: Implementation Pattern (per module)

**Module Structure:**

```
src/modules/[module]/
├── [module].module.ts
├── controller/
│   └── [module].controller.ts
├── service/
│   └── [module].service.ts
├── repository/
│   └── [module].repository.ts
├── dto/
│   ├── create-[module].dto.ts
│   ├── update-[module].dto.ts
│   └── [module]-response.dto.ts
└── [module].e2e-spec.ts
```

**Controller (Thin — HTTP handling only):**

```typescript
// src/modules/sop/controller/sop.controller.ts
@Controller('api/v1/sop')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SopController {
  constructor(private readonly sopService: SopService) {}

  @Post()
  @Roles('tim-penyusun')
  @HttpCode(201)
  async create(
    @Body() dto: CreateSopDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponseDto<SopResponseDto>> {
    const sop = await this.sopService.create(dto, user);
    return {
      data: SopResponseDto.fromEntity(sop),
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponseDto<SopResponseDto>> {
    const sop = await this.sopService.findOne(id, user);
    return {
      data: SopResponseDto.fromEntity(sop),
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Patch(':id/status')
  @Roles('tim-penyusun', 'biro-organisasi')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponseDto<SopResponseDto>> {
    const sop = await this.sopService.updateStatus(id, dto.status, user);
    return {
      data: SopResponseDto.fromEntity(sop),
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

**Service (Business Logic + Invariant Enforcement):**

```typescript
// src/modules/sop/service/sop.service.ts
@Injectable()
export class SopService {
  constructor(
    private readonly sopRepository: SopRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Transactional()
  async create(dto: CreateSopDto, user: User): Promise<SOP> {
    // Business rule: Check duplicate nomorSop
    const existing = await this.sopRepository.findByNomor(dto.nomorSop);
    if (existing) {
      throw new ConflictException('Nomor SOP sudah digunakan');
    }

    // Business rule: Check OPD ownership
    if (!user.canCreateSopIn(dto.opdId)) {
      throw new ForbiddenException('Tidak memiliki akses ke OPD ini');
    }

    // Business rule: Generate nomorSop otomatis jika tidak ada
    const nomorSop = dto.nomorSop || await this.generateNomorSop(dto.opdId);

    // Create domain entity
    const sop = SOP.create({
      judul: dto.judul,
      nomorSop,
      opdId: dto.opdId,
      status: 'DRAFT',
      userId: user.id,
    });

    // Persist
    return this.sopRepository.save(sop);
  }

  @Transactional()
  async updateStatus(
    id: string,
    newStatus: StatusSOP,
    user: User,
  ): Promise<SOP> {
    const sop = await this.sopRepository.findOne(id);
    if (!sop) {
      throw new NotFoundException('SOP tidak ditemukan');
    }

    // Business rule: Enforce valid status transition
    const validTransitions = VALID_TRANSITIONS[sop.status];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transisi status tidak valid: ${sop.status} → ${newStatus}`
      );
    }

    // Business rule: Check role permission
    if (!user.canChangeSopStatus(sop, newStatus)) {
      throw new ForbiddenException('Tidak memiliki izin mengubah status');
    }

    // Domain entity handles transition logic
    sop.changeStatus(newStatus);

    return this.sopRepository.save(sop);
  }

  async findOne(id: string, user: User): Promise<SOP> {
    const sop = await this.sopRepository.findOne(id);
    if (!sop) {
      throw new NotFoundException('SOP tidak ditemukan');
    }

    // Business rule: Check access permission
    if (!user.canViewSop(sop)) {
      throw new ForbiddenException('Tidak memiliki akses ke SOP ini');
    }

    return sop;
  }

  private async generateNomorSop(opdId: number): Promise<string> {
    // Format: SOP/[KODE-OPD]/[TAHUN]/[URUTAN]
    const opd = await this.prisma.oPD.findUnique({ where: { id: opdId } });
    const year = new Date().getFullYear();
    const count = await this.prisma.sOP.count({
      where: { opdId, createdAt: { gte: new Date(year, 0, 1) } },
    });
    const urutan = String(count + 1).padStart(3, '0');
    return `SOP/${opd.kode}/${year}/${urutan}`;
  }
}
```

**Repository (Data Access + Mapping):**

```typescript
// src/modules/sop/repository/sop.repository.ts
@Injectable()
export class SopRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<SOP | null> {
    const record = await this.prisma.sOP.findUnique({
      where: { id, deletedAt: null },
      include: {
        opd: true,
        detailSops: {
          where: { deletedAt: null },
          orderBy: { versi: 'desc' },
          take: 1,
        },
      },
    });

    if (!record) return null;

    return this.mapper.toDomain(record);
  }

  async findByNomor(nomorSop: string): Promise<SOP | null> {
    const record = await this.prisma.sOP.findFirst({
      where: { nomorSop, deletedAt: null },
    });

    if (!record) return null;

    return this.mapper.toDomain(record);
  }

  async save(sop: SOP): Promise<SOP> {
    const record = await this.prisma.sOP.upsert({
      where: { id: sop.id },
      update: this.mapper.toPrismaUpdate(sop),
      create: this.mapper.toPrismaCreate(sop),
    });

    return this.mapper.toDomain(record);
  }

  async findMany(filters: SopFilters): Promise<SOP[]> {
    const records = await this.prisma.sOP.findMany({
      where: {
        deletedAt: null,
        opdId: filters.opdId,
        status: filters.status,
      },
      include: {
        opd: true,
        _count: {
          select: { detailSops: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 20,
      skip: (filters.page ?? 1) * (filters.limit ?? 20),
    });

    return records.map(r => this.mapper.toDomain(r));
  }
}
```

**DTOs (Input Validation + Output Shaping):**

```typescript
// src/modules/sop/dto/create-sop.dto.ts
export class CreateSopDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  judul: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^SOP\/[A-Z0-9]+\/\d{4}\/\d+$/, {
    message: 'Format nomor SOP: SOP/XXX/YYYY/NNN',
  })
  @IsOptional()
  nomorSop?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  deskripsi?: string;

  @IsInt()
  @Min(1)
  opdId: number;
}

// src/modules/sop/dto/sop-response.dto.ts
export class SopResponseDto {
  @IsUuid()
  id: string;

  @IsString()
  judul: string;

  @IsString()
  nomorSop: string;

  @IsEnumEnum(StatusSOP)
  status: StatusSOP;

  @IsISO8601()
  createdAt: string;

  @IsOptional()
  @IsObject()
  opd?: OpdResponseDto;

  static fromEntity(sop: SOP): SopResponseDto {
    return {
      id: sop.id,
      judul: sop.judul,
      nomorSop: sop.nomorSop,
      status: sop.status,
      createdAt: sop.createdAt.toISOString(),
      opd: sop.opd ? OpdResponseDto.fromEntity(sop.opd) : undefined,
    };
  }
}
```

**Action Items:**
- [ ] Create module structure
- [ ] Implement controller (thin)
- [ ] Implement service (business logic)
- [ ] Implement repository (data access)
- [ ] Create DTOs (validation)
- [ ] Wire up module imports

---

### Phase 3: Testing (Critical Flows Only — 2-3 hours)

**API Contract Tests (Integration):**

```typescript
// src/modules/sop/sop.e2e-spec.ts
describe('SopController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdSopId: string;

  beforeAll(async () => {
    // Setup app with test database
    const moduleFixture = await Test.createTestingModule({
      imports: [SopModule, TestcontainersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login untuk dapat token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'tim-penyusun@example.com', password: 'password123' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/sop', () => {
    it('should create SOP with valid input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sop')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          judul: 'SOP Test E2E',
          nomorSop: 'SOP/E2E/2026/001',
          opdId: 1,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.data).toMatchObject({
            judul: 'SOP Test E2E',
            nomorSop: 'SOP/E2E/2026/001',
            status: 'DRAFT',
          });
          createdSopId = body.data.id;
        });
    });

    it('should return 409 for duplicate nomorSop', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sop')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          judul: 'SOP Test 2',
          nomorSop: 'SOP/E2E/2026/001', // Same as above
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({ judul: '' }) // Missing required fields
        .expect(422);
    });
  });

  describe('GET /api/v1/sop/:id', () => {
    it('should return SOP detail', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/sop/${createdSopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.id).toBe(createdSopId);
          expect(body.data.status).toBe('DRAFT');
        });
    });

    it('should return 404 for non-existent SOP', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sop/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/sop/:id/status', () => {
    it('should update status with valid transition', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sop/${createdSopId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SEDANG_DISUSUN' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.status).toBe('SEDANG_DISUSUN');
        });
    });

    it('should return 400 for invalid transition', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sop/${createdSopId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'BERLAKU' }) // Invalid: DRAFT → BERLAKU
        .expect(400);
    });
  });
});
```

**Action Items:**
- [ ] Write e2e tests for all endpoints
- [ ] Test happy path (valid input)
- [ ] Test error cases (409, 400, 401, 404)
- [ ] Run tests before deployment

---

## Output Contract

Generate implementation in this format:

```markdown
===========================================
BACKEND IMPLEMENTATION (FYP SIMPLIFIED)
===========================================
Module: [module name]
API Version: v1
Base Path: /api/v1/[resource]

---
API SPECIFICATION
---
[OpenAPI-style spec for each endpoint]

---
MODULE STRUCTURE
---
[File structure]

---
CONTROLLER
---
[Controller implementation]

---
SERVICE
---
[Service implementation with business logic]

---
REPOSITORY
---
[Repository implementation]

---
DTO SCHEMAS
---
[Create/Update/Response DTOs]

---
TESTS
---
[E2E test examples]

===========================================
IMPLEMENTATION QUALITY: HIGH / MEDIUM / LOW
Production Ready: YES / NO / NEEDS REVIEW
===========================================
```

---

## Trigger Conditions

Invoke this skill when:
- ✅ Implementing new NestJS module
- ✅ Creating API endpoints
- ✅ Designing service layer
- ✅ Writing DTOs and validation

Do NOT invoke when:
- ❌ Need deep domain modeling (use full `backend-engineer.md`)
- ❌ Refactoring existing module (direct edit faster)
- ❌ Quick bug fix (no spec needed)

---

*Last updated: 2026-04-01 — FYP Simplified from backend-engineer.md*
