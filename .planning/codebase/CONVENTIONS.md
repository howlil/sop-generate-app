# Development Conventions

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/` directory — Skill guidance untuk development dan analysis

## Skills Usage

Setiap task harus menggunakan skill yang sesuai dari `.skills/`:

| Task Type | Skill to Use | File Reference |
|-----------|--------------|----------------|
| Backend API Development | Backend Developer | `.skills/backend.md` |
| Database Schema Design | Database Engineer | `.skills/database.md` |
| System Diagrams | System Architect | `.skills/system-arch.md` |
| PRD Documentation | System Analyst | `.skills/sytem-analyst.md` |
| Frontend to PRD | Frontend to PRD | `.skills/system-fe-prd.md` |
| Codebase Audit | Fullstack Auditor | `.skills/fullstack-audit.md` |
| Testing Strategy | QA Engineer | `.skills/qa.md` |
| Database Audit | DB Auditor | `.skills/db-audit.md` |
| Frontend Review | Frontend Reviewer | `.skills/frontend-codereview.md` |

**Rule:** Sebelum memulai task, buka skill yang sesuai dan ikuti methodology yang didefinisikan di sana.

---

## Code Style

### TypeScript

**Naming Conventions:**
- Classes, Interfaces, Types, Enums: `PascalCase`
- Variables, Functions, Methods: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case.ts` (controllers, services, repositories)
- Route files: `{role}.{page}.tsx` (dot-separated)

**File Organization:**
- Server: `{domain}.controller.ts`, `{domain}.service.ts`, `{domain}.repository.ts`
- Client: `{role}.{page}.tsx`, `use{Feature}.ts`, `{domain}-store.ts`
- Co-locate tests: `*.spec.ts` next to source file

**Imports:**
- Absolute imports dengan path alias `@/*`
- Order: External libs → Internal modules → Relative imports
- Named exports preferred over default exports

### NestJS (Server)

**Module Structure:**
```typescript
// opd.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [OpdController],
  providers: [OpdService, OpdRepository],
  exports: [OpdService],
})
export class OpdModule {}
```

**Controller Pattern:**
```typescript
@Controller('opd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  @Post()
  @Roles('biro-organisasi')
  async create(@Body() dto: CreateOpdDto) {
    return this.opdService.create(dto);
  }
}
```

**Service Pattern (dengan constraint enforcement):**
```typescript
@Injectable()
export class SopService {
  constructor(private readonly sopRepository: SopRepository) {}

  async createDetailSop(dto: CreateDetailSopDto) {
    // Enforce constraint [P0-B]: hanya 1 BERLAKU per SOP
    if (dto.status === 'BERLAKU') {
      const existing = await this.sopRepository.findBerlakuBySopId(dto.sopId);
      if (existing) {
        throw new ConflictException('SOP sudah memiliki DetailSOP berstatus BERLAKU');
      }
    }

    return this.sopRepository.create(dto);
  }

  async updateStatus(id: string, newStatus: StatusSOP) {
    // Enforce constraint [P0-D]: valid transitions only
    const current = await this.sopRepository.findOne(id);
    const validTransitions = VALID_TRANSITIONS[current.status];
    
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${current.status} → ${newStatus}`
      );
    }

    return this.sopRepository.updateStatus(id, newStatus);
  }
}
```

**Repository Pattern:**
```typescript
@Injectable()
export class OpdRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOpdDto) {
    return this.prisma.oPD.create({
      data: dto,
      select: {
        id: true,
        nama: true,
        kode: true,
        _count: {
          select: {
            sop: true,
            pengguna: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    // Enforce Restrict delete behavior
    const children = await this.countChildren(id);
    if (children > 0) {
      throw new ConflictException(
        `OPD tidak bisa dihapus karena masih memiliki ${children} child entities`
      );
    }

    return this.prisma.oPD.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

**DTO Validation:**
```typescript
export class CreateSopDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsNotEmpty()
  nomorSop: string;

  @IsEnumEnum(StatusSOP)
  @IsOptional()
  status?: StatusSOP = 'DRAFT';

  @IsInt()
  @IsOptional()
  opdId?: number;
}
```

### React (Client)

**Component Pattern:**
```typescript
interface SopCardProps {
  sop: SopWithDetail;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SopCard({ sop, onEdit, onDelete }: SopCardProps) {
  const { user } = useAuth();
  const canEdit = canEditSop(sop.detail.status, user.role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sop.judul}</CardTitle>
        <StatusBadge status={sop.detail.status} />
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
      <CardFooter>
        {canEdit && (
          <Button onClick={() => onEdit(sop.id)}>Edit</Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

**Hook Pattern:**
```typescript
export function useSop() {
  const queryClient = useQueryClient();
  const { data: sops, isLoading } = useQuery({
    queryKey: ['sops', { opdId, status }],
    queryFn: () => sopApi.getList({ opdId, status }),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSopDto) => sopApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
    },
  });

  return { sops, isLoading, createMutation };
}
```

**Store Pattern (Zustand):**
```typescript
interface SopStore {
  sops: SopWithDetail[];
  selectedSop: SopWithDetail | null;
  setSops: (sops: SopWithDetail[]) => void;
  selectSop: (id: string) => void;
}

export const useSopStore = create<SopStore>()(
  persist(
    (set) => ({
      sops: [],
      selectedSop: null,
      setSops: (sops) => set({ sops }),
      selectSop: (id) =>
        set((state) => ({
          selectedSop: state.sops.find((s) => s.id === id) || null,
        })),
    }),
    { name: 'sop-store' }
  )
);
```

---

## Testing Conventions

### Server (Jest)

**Unit Test Pattern:**
```typescript
describe('OpdService', () => {
  let service: OpdService;
  let repository: MockType<OpdRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    service = new OpdService(repository as any);
  });

  it('should create OPD successfully', async () => {
    const dto: CreateOpdDto = { nama: 'OPD Test', kode: 'OPD-001' };
    repository.create.mockResolvedValue({ id: 1, ...dto });

    const result = await service.create(dto);

    expect(result).toEqual({ id: 1, ...dto });
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when creating duplicate KEPALA_OPD', async () => {
    repository.findKepalaOpd.mockResolvedValue({ id: 1 });

    await expect(
      service.createUser({ opdId: 1, peran: 'KEPALA_OPD' })
    ).rejects.toThrow(ConflictException);
  });
});
```

**E2E Test Pattern:**
```typescript
describe('/api/v1/opd (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await loginAs('biro-organisasi');
  });

  it('POST /opd should create new OPD', () => {
    return request(app.getHttpServer())
      .post('/api/v1/opd')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nama: 'OPD Baru', kode: 'OPD-BARU' })
      .expect(201);
  });

  it('GET /opd should return 403 for tim-penyusun', () => {
    return request(app.getHttpServer())
      .get('/api/v1/opd')
      .set('Authorization', `Bearer ${timPenyusunToken}`)
      .expect(403);
  });
});
```

### Client (Vitest + Testing Library)

**Component Test Pattern:**
```typescript
describe('SopCard', () => {
  it('should render SOP title and status badge', () => {
    const sop = mockSopWithDetail({ judul: 'Test SOP', status: 'DRAFT' });
    
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Test SOP')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('should show edit button for Tim Penyusun', () => {
    const sop = mockSopWithDetail({ status: 'DRAFT' });
    mockAuth({ role: 'tim-penyusun' });
    
    render(<SopCard sop={sop} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
```

**Domain Function Test Pattern:**
```typescript
describe('canEditSop', () => {
  it('should return true for DRAFT status', () => {
    expect(canEditSop('DRAFT', 'tim-penyusun')).toBe(true);
  });

  it('should return false for DIAJUKAN_EVALUASI status', () => {
    expect(canEditSop('DIAJUKAN_EVALUASI', 'tim-penyusun')).toBe(false);
  });

  it('should return false for non-tim-penyusun role', () => {
    expect(canEditSop('DRAFT', 'biro-organisasi')).toBe(false);
  });
});
```

---

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature (SOP creation, TTE signing)
- `fix`: Bug fix
- `refactor`: Code refactoring without behavior change
- `test`: Adding or updating tests
- `docs`: Documentation updates
- `chore`: Build/config changes, dependency updates
- `constraint`: Constraint enforcement implementation

**Scopes:**
- `auth`, `opd`, `peraturan`, `sop`, `langkah-sop`, `diagram`, `pelaksana`, `tim`, `evaluasi`, `tte`, `audit`

**Examples:**
```
feat(sop): add DetailSOP creation endpoint

Implements SOP-01 requirement for creating new DetailSOP with status DRAFT.
Enforces constraint [P0-B] for unique BERLAKU status per SOP.

Closes #123

---

fix(evaluasi): handle optimistic locking conflict on NilaiEvaluasi update

Returns 409 Conflict with current version when version mismatch occurs.
Implements constraint [P0-E] for optimistic locking.

---

constraint(tte): enforce XOR constraint on RiwayatTandaTangan

Validates exactly one of sopDetailId or pengajuanEvaluasiId is provided.
Implements constraint [P1-A] at service layer.
```

### Branch Naming

```
<type>/<scope>-<description>

Examples:
- feat/sop-detail-sop-creation
- fix/evaluasi-optimistic-locking
- constraint/tte-xor-validation
- docs/erd-alignment
```

---

## Documentation Conventions

### Code Comments

**When to Comment:**
- Complex business logic (constraint enforcement, status transitions)
- Non-obvious workarounds (Prisma limitations, database quirks)
- Public API documentation (JSDoc for controllers, services)

**When NOT to Comment:**
- Obvious variable declarations
- Simple CRUD operations
- Code that explains itself

**Comment Style:**
```typescript
/**
 * Creates a new DetailSOP with automatic nomorSOP generation.
 * 
 * @param dto - DetailSOP creation data
 * @param user - Creating user (must be Tim Penyusun)
 * @returns Created DetailSOP with auto-generated nomorSOP
 * 
 * @throws ConflictException if nomorSOP already exists
 * @throws BadRequestException if status transition invalid
 * 
 * Constraint: [P0-B] - Only 1 DetailSOP with status BERLAKU per SOP
 */
async createDetailSop(dto: CreateDetailSopDto, user: User) {
  // ...
}
```

### README Updates

Update README.md when:
- Adding new modules
- Changing environment variables
- Adding new requirements
- Updating setup instructions

---

## Database Conventions

### Prisma Schema

**Model Naming:**
- PascalCase for model names: `DetailSOP`, `PengajuanEvaluasi`
- camelCase for field names: `nomorSop`, `createdAt`
- SCREAMING_SNAKE_CASE for enum values: `DRAFT`, `SESUAI`

**Relation Naming:**
```prisma
model DetailSOP {
  id                   String    @id @default(uuid())
  sopId                String
  sop                  SOP       @relation(fields: [sopId], references: [id], onDelete: Cascade)
  langkahSops          LangkahSOP[]
  
  @@unique([sopId, versi])
}

model LangkahSOP {
  id                   String    @id @default(uuid())
  sopDetailId          String
  sopDetail            DetailSOP @relation(fields: [sopDetailId], references: [id], onDelete: Restrict)
  
  @@unique([sopDetailId, urutan])
}
```

**Migration Naming:**
```bash
npx prisma migrate dev --name init_schema_20_models
npx prisma migrate dev --name add_constraint_p2d_kepala_opd
npx prisma migrate dev --name add_optimistic_locking_nilai_evaluasi
```

---

## Error Handling

### Server Error Responses

**Standard Error Format:**
```json
{
  "statusCode": 409,
  "message": "OPD tidak bisa dihapus karena masih memiliki 5 child entities",
  "error": "Conflict",
  "code": "OPD_HAS_CHILDREN"
}
```

**Custom Exception Classes:**
```typescript
export class ConstraintViolationException extends ConflictException {
  constructor(constraint: string, message: string) {
    super({
      statusCode: 409,
      message,
      error: 'Conflict',
      code: 'CONSTRAINT_VIOLATION',
      constraint,
    });
  }
}

// Usage:
throw new ConstraintViolationException(
  '[P2-D]',
  'OPD ini sudah memiliki KEPALA_OPD aktif'
);
```

### Client Error Handling

**Hook Pattern:**
```typescript
export function useCreateSop() {
  return useMutation({
    mutationFn: (dto: CreateSopDto) => sopApi.create(dto),
    onError: (error: AxiosError<ApiError>) => {
      const data = error.response?.data;
      
      if (data?.code === 'CONSTRAINT_VIOLATION') {
        toast.error(`Constraint violation: ${data.message}`);
      } else if (data?.statusCode === 409) {
        toast.error('Conflict: ' + data.message);
      } else {
        toast.error('Failed to create SOP');
      }
    },
  });
}
```

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
