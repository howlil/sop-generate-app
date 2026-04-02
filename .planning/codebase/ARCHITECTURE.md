# System Architecture

**Project**: Sistem Informasi SOP Biro Organisasi  
**Architecture Pattern**: Modular Monolith with Clean Architecture Principles

---

## 1. High-Level Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │  Pages   │  │Components│  │  Hooks   │  │ Stores  │ │   │
│  │  │  (Routes)│  │   (UI)   │  │ (Logic)  │  │(Zustand)│ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON (JWT)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    NestJS Backend                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │Controllers│  │ Services │  │   DTOs   │  │ Guards  │ │   │
│  │  │  (REST)  │  │ (Business)│  │(Validate)│  │ (RBAC)  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │Repositories│ │  Filters │  │  Pipes   │  │ Modules │ │   │
│  │  │ (Prisma)  │  │(Exception)│ │(Validate)│  │(Feature)│ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     MySQL 8.0                            │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Tables: Pengguna, SOP, DetailSOP, LangkahSOP,   │   │   │
│  │  │  DiagramLayout, PengajuanEvaluasi, NilaiEvaluasi,│   │   │
│  │  │  OPD, Peraturan, Tim, TTE, Audit Logs            │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Component Architecture
**Pattern**: Atomic Design with Feature-based Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI atoms/molecules
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── auth/            # Authentication feature components
│   ├── sop/             # SOP management feature components
│   ├── evaluasi/        # Evaluation feature components
│   └── layout/          # Layout components (Sidebar, Header)
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── services/            # API service layer
└── routes/              # Route configuration
```

### State Management Architecture

#### Server State (TanStack Query)
```typescript
// Pattern: Query key factory + hooks
const queryKeys = {
  all: ['sop'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filter: SopFilter) => [...queryKeys.lists(), filter] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
}

// Usage in components
const { data, isLoading } = useSuspenseQuery({
  queryKey: queryKeys.detail(id),
  queryFn: () => sopService.getById(id),
})
```

#### Client State (Zustand)
```typescript
// Pattern: Slice pattern for modular stores
interface UIStore {
  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Toast) => void
  
  // Dialog state
  dialogs: DialogState[]
  openDialog: (config: DialogConfig) => void
}

// Usage
const { addToast } = useUIStore()
```

### Routing Architecture
**Pattern**: File-based routing with TanStack Router

```
routes/
├── __root.tsx           # Root route with layout
├── index.tsx            # Landing page
├── login.tsx            # Login page
├── _auth/               # Auth layout group
│   ├── dashboard.tsx
│   └── ...
└── _public/             # Public layout group
    └── ...

// Route tree generated automatically (routeTree.gen.ts)
```

**Route Protection Pattern**:
```typescript
// In _auth.tsx layout
beforeLoad: async ({ context, location }) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
  if (!context.auth.hasRole(requiredRole)) {
    throw redirect({ to: '/unauthorized' })
  }
}
```

### Data Flow Pattern
```
Component → useQuery → Service (axios) → API → Response
                ↓
         Query Cache (TanStack Query)
                ↓
         Component Re-render
```

---

## 3. Backend Architecture

### Module Structure (NestJS)
```
src/
├── common/              # Shared utilities
│   ├── prisma/          # Prisma service & module
│   ├── logger/          # Winston configuration
│   ├── filters/         # Global exception filters
│   ├── guards/          # JWT & Roles guards
│   ├── interceptors/    # Response transformation
│   └── decorators/      # Custom decorators
├── config/              # Configuration & env validation
├── modules/             # Feature modules
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── controller/
│   │   │   └── auth.controller.ts
│   │   ├── service/
│   │   │   └── auth.service.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   ├── users/
│   ├── sop/
│   ├── evaluasi/
│   └── ...
├── generated/           # Prisma generated types
├── app.module.ts        # Root module
└── main.ts              # Application bootstrap
```

### Module Dependency Graph
```
AppModule
├── ConfigModule (global)
├── WinstonModule (global logging)
├── ThrottlerModule (rate limiting)
├── PrismaModule (database)
├── AuthModule
├── UsersModule
├── HealthModule
├── OpdModule
├── PeraturanModule
├── TimModule
├── SopModule
├── EvaluasiModule
├── TteModule
└── AuditModule
```

### Service Layer Pattern
```typescript
// Pattern: Repository pattern with Prisma
@Injectable()
export class SopService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createSOP(dto: CreateSOPDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create SOP
      const sop = await tx.sop.create({ data: dto })
      
      // 2. Create initial DetailSOP (draft)
      const detail = await tx.detailSOP.create({
        data: { sopId: sop.id, status: 'DRAFT', ... }
      })
      
      // 3. Log audit
      await this.auditService.log(tx, {
        sopDetailId: detail.id,
        userId,
        action: 'CREATE_SOP',
      })
      
      return detail
    })
  }
}
```

### Controller Pattern
```typescript
@Controller('api/v1/sop')
@ApiTags('SOP')
export class SopController {
  constructor(private sopService: SopService) {}

  @Post()
  @ApiOperation({ summary: 'Create new SOP' })
  @ApiResponse({ status: 201, type: SOPDetail })
  @Throttle('general')  // Rate limit
  create(@Body() dto: CreateSOPDto, @User() user: UserPayload) {
    return this.sopService.createSOP(dto, user.sub)
  }
}
```

### Guard Pattern
```typescript
// JWT Guard (global)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }
}

// Roles Guard (global)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PeranPengguna[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true
    
    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.peran)
  }
}
```

---

## 4. Data Architecture

### Entity Relationship Overview
```
┌─────────────┐       ┌─────────────┐
│    OPD      │◄──────│   Pengguna  │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │ 1:N                 │ 1:N
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    SOP      │       │KredensialTTE│
└──────┬──────┘       └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌─────────────┐
│ DetailSOP   │◄──────│Pelaksana    │
└──────┬──────┘       └─────────────┘
       │
       ├──────────┬──────────┬──────────┐
       │ 1:N      │ 1:N      │ 1:N      │ 1:N
       ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│ Langkah  │ │ Diagram  │ │Lampiran│ │DasarHukum│
│   SOP    │ │  Layout  │ │  Teks  │ │          │
└──────────┘ └──────────┘ └─────────┘ └──────────┘

┌─────────────┐       ┌─────────────┐
│Pengajuan    │◄──────│Nilai        │
│Evaluasi     │       │Evaluasi     │
└─────────────┘       └─────────────┘
```

### Key Entity Relationships

#### SOP Lifecycle
```
SOP (1) ──→ DetailSOP (N versions)
                    │
                    ├─→ Status: DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI →
                    │   DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI →
                    │   SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO → BERLAKU
                    │
                    ├─→ LangkahSOP (N steps)
                    │         │
                    │         ├─→ Decision branches (Ya/Tidak)
                    │         └─→ Pelaksana (executor)
                    │
                    ├─→ DiagramLayout (visual representation)
                    │         ├─→ DiagramNodePosition
                    │         └─→ DiagramEdge
                    │
                    └─→ RiwayatTandaTangan (signatures)
```

#### Evaluation Flow
```
OPD ──→ PengajuanEvaluasi (submission)
              │
              ├─→ Jenis: TERJADWAL | MANDIRI
              ├─→ Status: MENUNGGU_EVALUASI → SEDANG_DIEVALUASI →
              │   SELESAI_DIEVALUASI → DIVERIFIKASI_BIRO →
              │   DITANDATANGANI_KOORDINATOR → SELESAI
              │
              └─→ NilaiEvaluasi (N evaluations per SOP)
```

### Database Constraints

#### Unique Constraints
- `Pengguna`: email, nip (unique per user)
- `DetailSOP`: [sopId, versi], [nomorSOP]
- `Peraturan`: [opdId, nomor, tahun]
- `AnggotaTimPenyusun`: [userId, opdId]

#### Indexes for Performance
```prisma
@@index([opdId])
@@index([deletedAt])
@@index([opdId, deletedAt])
@@index([sopId, status])
@@index([status])
```

---

## 5. API Design

### RESTful Conventions
```
GET    /api/v1/sop              # List SOPs
GET    /api/v1/sop/:id          # Get SOP by ID
POST   /api/v1/sop              # Create SOP
PUT    /api/v1/sop/:id          # Update SOP
DELETE /api/v1/sop/:id          # Delete SOP

POST   /api/v1/sop/:id/submit   # Submit for evaluation
POST   /api/v1/sop/:id/approve  # Approve SOP
```

### Response Format
```typescript
// Success response
{
  "data": { /* resource */ },
  "meta": {
    "timestamp": "2026-04-03T10:00:00Z",
    "path": "/api/v1/sop/123"
  }
}

// Error response
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [/* validation errors */],
  "timestamp": "2026-04-03T10:00:00Z",
  "path": "/api/v1/sop"
}
```

### Versioning Strategy
- **Type**: URI Versioning
- **Default Version**: v1
- **Pattern**: `/api/v1/resource`

---

## 6. Security Architecture

### Authentication Flow
```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  POST /login {email, password}          │
     │────────────────────────────────────────>│
     │                                         │
     │                              Verify credentials
     │                              Generate JWT
     │                                         │
     │  Response: { accessToken, refreshToken }│
     │<────────────────────────────────────────│
     │                                         │
     │  GET /sop                               │
     │  Authorization: Bearer <token>          │
     │────────────────────────────────────────>│
     │                                         │
     │                              Validate JWT
     │                              Extract user
     │                                         │
     │  Response: { data: [...] }              │
     │<────────────────────────────────────────│
```

### Authorization Model (RBAC)
```typescript
// Role hierarchy (no inheritance - flat)
enum PeranPengguna {
  BIRO_ORGANISASI,         // System admin
  TIM_EVALUASI,            // Evaluator
  TIM_PENYUSUN,            // SOP author
  KOORDINATOR_TIM_PENYUSUN, // Submit for evaluation
  KEPALA_OPD,              // Final approver
}

// Permission matrix
const PERMISSIONS = {
  SOP_CREATE: ['TIM_PENYUSUN', 'KOORDINATOR_TIM_PENYUSUN'],
  SOP_SUBMIT: ['KOORDINATOR_TIM_PENYUSUN'],
  SOP_EVALUATE: ['TIM_EVALUASI'],
  SOP_APPROVE: ['BIRO_ORGANISASI', 'KEPALA_OPD'],
}
```

---

## 7. Error Handling Architecture

### Global Exception Filter
```typescript
// Catches all unhandled exceptions
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Map to standard HTTP response
    // Log with Winston
    // Return consistent error format
  }
}

// Exception hierarchy
HttpException (base)
├── BadRequestException (400)
├── UnauthorizedException (401)
├── ForbiddenException (403)
├── NotFoundException (404)
├── ConflictException (409)
└── InternalServerErrorException (500)
```

### Frontend Error Handling
```typescript
// Axios interceptor for global error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    if (error.response?.status === 403) {
      // Show unauthorized page
    }
    // Show toast notification
    uiStore.addToast({
      type: 'error',
      title: 'Error',
      description: error.response?.data.message,
    })
    throw error
  }
)
```

---

## 8. Logging & Monitoring Architecture

### Winston Configuration
```typescript
// Development: Console with colors
// Production: JSON format for log aggregation

{
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? json() : colorize()
  ),
  transports: [new transports.Console()]
}
```

### Audit Logging
```typescript
// Every significant action logged
interface LogEditSOP {
  sopDetailId: string
  userId: string
  bagian: BagianSOP  // METADATA, LANGKAH_SOP, LAMPIRAN_TEKS, etc.
  entityId?: string
  keterangan?: string
  createdAt: DateTime
}

// Usage in service
await this.prisma.logEditSOP.create({
  data: {
    sopDetailId: detail.id,
    userId: user.id,
    bagian: 'LANGKAH_SOP',
    entityId: langkah.id,
    keterangan: 'Added new step',
  }
})
```

---

## 9. Deployment Architecture

### Docker Compose Services
```yaml
services:
  db:       # MySQL 8.0 (stateful)
  server:   # NestJS API (stateless)
  client:   # React SPA (stateless)

networks:
  sop-network:  # Internal network

volumes:
  db_data:              # Persistent database
  server_prisma_generated:  # Prisma client
```

### Environment Strategy
```
Development:
  - Hot reload enabled
  - CORS: allow all
  - Source maps enabled
  - Debug logging

Production:
  - Hot reload disabled
  - CORS: whitelist only
  - Source maps disabled
  - Info/error logging only
  - Rate limiting strict
```

---

## 10. Design Patterns Used

### Backend Patterns
| Pattern | Usage |
|---------|-------|
| Repository | Prisma service wraps database access |
| Service Layer | Business logic in service classes |
| Dependency Injection | NestJS IoC container |
| Guard | Authentication & authorization |
| Filter | Global exception handling |
| Pipe | Validation & transformation |
| Module | Feature encapsulation |
| DTO | Data transfer with validation |

### Frontend Patterns
| Pattern | Usage |
|---------|-------|
| Container/Presentational | Pages vs Components |
| Custom Hooks | Reusable logic (useSOP, useEvaluasi) |
| Compound Components | UI components with subcomponents |
| Render Props | TanStack Query hooks |
| State Slices | Zustand store organization |
| File-based Routing | TanStack Router |

### Database Patterns
| Pattern | Usage |
|---------|-------|
| Soft Delete | deletedAt timestamp |
| Optimistic Locking | version field (PengajuanEvaluasi, NilaiEvaluasi) |
| Audit Trail | LogEditSOP, LogNilaiEvaluasi |
| Cascade Delete | Parent-child relationships |
| Junction Tables | Many-to-many (SopTerkait, DasarHukum) |

---

## 11. Architecture Decisions

### Why Modular Monolith?
- **Clear boundaries**: Each module encapsulates related functionality
- **Easy to scale**: Can extract modules to microservices if needed
- **Single deployment**: Simpler than microservices for current scale
- **Shared database**: Efficient joins, transactions

### Why Prisma?
- **Type safety**: Auto-generated types from schema
- **Migration management**: Built-in migration system
- **Developer experience**: Intuitive API, great IDE support
- **Relationship handling**: Easy navigation between related records

### Why TanStack Router?
- **Type-safe routes**: Route parameters validated at compile time
- **Code splitting**: Automatic per-route
- **Loader pattern**: Data fetching before render
- **SSR ready**: Future-proof for server-side rendering

### Why Zustand?
- **Minimal boilerplate**: No providers needed
- **Type-safe**: Full TypeScript support
- **Small bundle**: ~1KB
- **Flexible**: Can use selectors, actions, or both
