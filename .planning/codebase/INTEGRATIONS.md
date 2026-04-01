# Integrations

## Single Source of Truth

**Dokumen referensi wajib:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements
- `.skills/` directory — Skill guidance untuk development

## Skills Reference

Integration development menggunakan skill dari `.skills/`:

| Integration Task | Skill | File |
|-----------------|-------|------|
| API Contract Design | Backend Developer | `.skills/backend.md` |
| Database Integration | Database Engineer | `.skills/database.md` |
| Fullstack Integration Review | Fullstack Auditor | `.skills/fullstack-audit.md` |
| API Testing | QA Engineer | `.skills/qa.md` |

**Usage:**
- Sebelum design API endpoints → buka `.skills/backend.md` untuk spec-driven approach
- Sebelum integration testing → buka `.skills/qa.md` untuk testing strategy
- Sebelum production deployment → buka `.skills/fullstack-audit.md` untuk integration audit

---

## Overview

Sistem Informasi SOP Biro Organisasi saat ini merupakan monorepo dengan dua aplikasi yang berjalan independen:
- **Server** (NestJS): REST API untuk business logic dan data persistence
- **Client** (React): SPA untuk user interface

Saat ini client berjalan dalam **demo mode** dengan seed JSON dan Zustand stores. Phase berikutnya adalah **API integration** untuk menghubungkan client ke server.

---

## Internal Integrations

### Client ↔ Server (REST API)

**Status:** Not connected (demo mode)
**Phase:** Phase 2+ (setelah Auth module selesai)

**Integration Points:**
```typescript
// Client API client (to be implemented)
// src/lib/api/config.ts
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
};

// src/lib/api/auth.api.ts
export const authApi = {
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await axios.post(`${apiConfig.baseURL}/auth/login`, credentials);
    return response.data;
  },
  
  me: async (token: string): Promise<User> => {
    const response = await axios.get(`${apiConfig.baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// src/hooks/use-auth.ts
export function useAuth() {
  const { setToken, setUser } = useAuthStore();
  
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.access_token);
      setUser(data.user);
    },
  });
  
  return { login: loginMutation.mutateAsync };
}
```

**API Endpoints (to be implemented):**

| Module | Endpoint | Method | Auth | Role | Description |
|--------|----------|--------|------|------|-------------|
| Auth | `/auth/login` | POST | No | All | Login dengan email + password |
| Auth | `/auth/me` | GET | Yes | All | Get current user info |
| OPD | `/opd` | GET | Yes | All | List OPD (filtered by role) |
| OPD | `/opd` | POST | Yes | Biro | Create new OPD |
| OPD | `/opd/:id` | PUT | Yes | Biro | Update OPD |
| Peraturan | `/peraturan` | GET | Yes | All | List peraturan (filtered by OPD) |
| Peraturan | `/peraturan` | POST | Yes | Biro | Create peraturan |
| SOP | `/sop` | GET | Yes | All | List SOP (filtered by role/status) |
| SOP | `/sop` | POST | Yes | Tim Penyusun | Create new SOP |
| DetailSOP | `/detail-sop` | POST | Yes | Tim Penyusun | Create DetailSOP |
| DetailSOP | `/detail-sop/:id` | PUT | Yes | Tim Penyusun | Update DetailSOP |
| Evaluasi | `/pengajuan-evaluasi` | POST | Yes | Biro | Create pengajuan |
| Evaluasi | `/nilai-evaluasi` | PUT | Yes | Tim Evaluasi | Submit hasil evaluasi |
| TTE | `/tte/sign` | POST | Yes | All roles | Sign document with PIN |

**Mock Data Migration:**
```typescript
// Current: Seed JSON (demo mode)
import sopData from '@/lib/seed/sop-daftar.json';
const sops = sopData;

// Future: API integration (production mode)
const { data: sops } = useSopList({ opdId, status });
```

---

## External Integrations (Future)

### Email Service (SMTP)

**Purpose:** Email verification untuk TTE setup dan notifikasi
**Status:** Not implemented
**Phase:** Phase 7 (TTE module)

**Integration Points:**
```typescript
// Server: Email service (to be implemented)
// src/common/email/email.service.ts
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  async sendVerificationEmail(email: string, token: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verifikasi Email - TTE Setup',
      html: `
        <p>Klik link berikut untuk verifikasi email:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">
          Verifikasi Email
        </a>
      `,
    });
  }
}
```

**Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=app-password
SMTP_FROM=Sistem SOP <noreply@example.com>
```

---

### Database (MariaDB)

**Purpose:** Data persistence untuk semua domain entities
**Status:** Schema ready, migration pending
**Phase:** Phase 1 (Database & Infrastructure)

**Connection:**
```typescript
// Server: Prisma connection
// src/common/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Environment:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=secret
DATABASE_NAME=sop_biro_organisasi
DATABASE_URL=mysql://root:secret@localhost:3306/sop_biro_organisasi
```

**Schema:** 20 models, 12+ enums (sesuai `docs/ERD-DESKRIPSI.md`)

---

## Integration Testing

### E2E Test Setup

```typescript
// server/test/app.e2e-spec.ts
describe('SOP Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    // Setup test database
    const module: TestingModule = await Test.createTestingModule({
      imports: [SopModule, AuthModule, PrismaModule],
    }).compile();
    
    app = module.createNestApplication();
    await app.init();
    
    // Login untuk dapat token
    authToken = await loginAs('tim-penyusun');
  });
  
  it('should create new SOP successfully', () => {
    return request(app.getHttpServer())
      .post('/api/v1/sop')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        judul: 'SOP Test',
        nomorSop: 'SOP/TEST/2026/001',
      })
      .expect(201);
  });
  
  afterAll(async () => {
    await app.close();
  });
});
```

### API Integration Test (Client)

```typescript
// client/src/hooks/__tests__/use-sop.test.ts
describe('useSop (integration)', () => {
  it('should fetch SOPs from API', async () => {
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
});
```

---

## Integration Roadmap

| Phase | Integration | Status | Dependencies |
|-------|-------------|--------|--------------|
| Phase 1 | Prisma ↔ MariaDB | Pending | Database instance |
| Phase 2 | Client ↔ Auth API | Pending | Auth module (server) |
| Phase 3 | Client ↔ OPD/Peraturan API | Pending | OPD/Peraturan modules |
| Phase 5 | Client ↔ SOP API | Pending | SOP module |
| Phase 6 | Client ↔ Evaluasi API | Pending | Evaluasi module |
| Phase 7 | Server ↔ Email (SMTP) | Pending | TTE module |
| Phase 7 | Client ↔ TTE API | Pending | TTE module |

---

## Data Flow

### Current (Demo Mode)
```
User Action → Hook → Zustand Store → Seed JSON → UI Update
```

### Future (Production)
```
User Action → Hook → API Call → Server (Controller → Service → Repository → Prisma) → MariaDB
                                                              ↓
UI Update ← Store Refresh ← Response ← ValidationPipe ← DTO
```

---

## Security Considerations

### Authentication Flow
```typescript
// 1. Login
POST /auth/login { email, password }
→ JWT token (exp: 1h)

// 2. Protected Request
GET /sop
Headers: Authorization: Bearer <JWT>
→ Server validates JWT, extracts userId/role/opdId

// 3. Role-Based Access
@Roles('tim-penyusun')
→ Server checks role in JWT
→ Returns 403 if role mismatch
```

### CORS Configuration
```typescript
// server/src/main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

### Rate Limiting (Production)
```typescript
// server/src/main.ts
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
```

---

## Migration Strategy

### Phase 1: Schema Migration
```bash
# Squash existing migrations
npx prisma migrate dev --name init_20_models

# Generate Prisma client
npx prisma generate

# Run migration on production
npx prisma migrate deploy
```

### Phase 2: Seed Data Migration
```typescript
// server/prisma/seed.ts
import { faker } from '@faker-js/faker';

async function seedOpd() {
  for (let i = 0; i < 10; i++) {
    await prisma.oPD.create({
      data: {
        nama: faker.company.name(),
        kode: `OPD-${faker.string.numeric(3)}`,
      },
    });
  }
}

async function seedSop() {
  // Seed SOP dengan status distribution
  const statuses: StatusSOP[] = ['DRAFT', 'SIAP_DIEVALUASI', 'BERLAKU'];
  
  for (const status of statuses) {
    await prisma.sOP.create({
      data: {
        // ...
        detailSops: {
          create: {
            status,
            // ...
          },
        },
      },
    });
  }
}
```

### Phase 3: Client Migration (Demo → Production)
```typescript
// Toggle between mock and API
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useSopList(filters: SopFilters) {
  if (USE_MOCK) {
    // Current: return seed data
    return { data: mockSops, isLoading: false };
  }
  
  // Future: call API
  return useQuery({
    queryKey: ['sops', filters],
    queryFn: () => sopApi.getList(filters),
  });
}
```

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*
