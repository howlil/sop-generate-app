# External Integrations

**Project**: Sistem Informasi SOP Biro Organisasi  
**Integration Points**: Third-party services, APIs, and external dependencies

---

## 1. Authentication & Authorization

### JWT-based Authentication
| Aspect | Details |
|--------|---------|
| **Type** | Stateless JWT tokens |
| **Algorithm** | HS256 (default for @nestjs/jwt) |
| **Token Lifetime** | 15 minutes (configurable via JWT_EXPIRATION) |
| **Refresh Token** | 7 days (configurable via JWT_REFRESH_EXPIRATION) |
| **Storage** | Client-side (browser memory/localStorage) |
| **Transmission** | Authorization header: `Bearer <token>` |

### Passport Strategy
- **Strategy**: JWT Strategy (passport-jwt)
- **Extraction**: From Authorization header
- **Global Guard**: JwtAuthGuard applied globally via app.useGlobalGuards()

### Role-based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| BIRO_ORGANISASI | System admin, final verification, TTE |
| TIM_EVALUASI | Evaluate SOPs |
| TIM_PENYUSUN | Create and edit SOPs |
| KOORDINATOR_TIM_PENYUSUN | Submit SOPs for evaluation, TTE |
| KEPALA_OPD | Approve SOPs, TTE |

---

## 2. Database Integration

### MySQL Connection
```
mysql://root:${DB_ROOT_PASSWORD}@db:3306/${DB_NAME}?connection_limit=10
```

**Connection Details**:
- **Host**: db (Docker service name)
- **Port**: 3306
- **User**: root
- **Connection Limit**: 10 concurrent connections
- **Adapter**: @prisma/adapter-mariadb (MySQL-compatible)

### Prisma Integration
- **Generator**: prisma-client-js with CJS module format
- **Output**: `../src/generated/prisma` (custom output for better organization)
- **Features Used**:
  - Relations with cascade/restrict policies
  - Indexes for query optimization
  - Enums for type safety
  - DateTime with @default(now()) and @updatedAt

### Database Initialization
- **Init Script**: `/docker-entrypoint-initdb.d/prisma-init` (volume mount)
- **Migrations**: `prisma migrate deploy` on container startup
- **Seed Data**: prisma/seed.ts (configured in package.json)

---

## 3. Digital Signature (TTE - Tanda Tangan Elektronik)

### TTE System Overview
The system implements electronic signature functionality with the following components:

**TTE Roles** (PeranTTE enum):
- KEPALA_OPD
- BIRO_ORGANISASI
- KOORDINATOR_TIM_PENYUSUN

### TTE Credential Management
| Component | Details |
|-----------|---------|
| **Table** | KredensialTTE (ProfilTTE) |
| **PIN Hashing** | bcrypt |
| **Email Verification** | emailTerverifikasi boolean flag |
| **Token Verification** | tokenVerifikasi + tokenExpiry |

### Signature Recording
| Table | Purpose |
|-------|---------|
| RiwayatTandaTangan | Audit trail of all signatures |
| **Fields** | hashDokumen, nomorDokumen, jenisDokumen, ditandatanganiPada |
| **References** | sopDetailId XOR pengajuanEvaluasiId (mutually exclusive) |

### TTE Validation Rules
1. **XOR Constraint**: Signature must reference exactly one document type
2. **Role Compatibility**: PeranTTE must match Pengguna.peran
3. **Uniqueness**: One signature per role per document

---

## 4. Email Integration (Potential)

### Current State
- **Email Verification Flag**: `emailTerverifikasi` in KredensialTTE
- **No Active Email Service**: No SMTP or email API integration found in codebase

### Recommended Future Integration
For production deployment, consider adding:
- **SMTP** (nodemailer) or
- **Email API** (SendGrid, AWS SES, Mailgun)

Use cases:
- TTE PIN verification
- Password reset
- SOP status change notifications
- Evaluation assignment notifications

---

## 5. File Storage (Current Approach)

### Logo & Document Storage
- **Current**: Base64 string storage in database (string fields in schema)
- **Fields**: `logoInstansi` in DetailSOP

### Recommended Future Integration
For production with high volume:
- **Object Storage**: AWS S3, Google Cloud Storage, or MinIO (self-hosted)
- **CDN**: For logo and attachment delivery

---

## 6. External API Dependencies

### No Direct External API Calls
Based on codebase analysis, the system is **self-contained** with no active external API integrations for:
- ❌ Payment gateways
- ❌ SMS services
- ❌ Push notifications
- ❌ Social media login
- ❌ Map services
- ❌ Analytics

### Potential Future Integrations
1. **National SSO Integration** (for government unified login)
2. **Document Management System** (for archival)
3. **Notification Service** (WhatsApp/Email for alerts)
4. **Analytics** (for usage metrics)

---

## 7. CORS Configuration

### Allowed Origins
```typescript
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production CORS Strategy
```typescript
origin: process.env.NODE_ENV === 'production'
  ? (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS policy violation'))
      }
    }
  : true  // Allow all in development
```

### Allowed Methods
- GET, POST, PUT, PATCH, DELETE, OPTIONS

### Allowed Headers
- Content-Type, Authorization

### Credentials
- Enabled (credentials: true)

---

## 8. Rate Limiting

### Auth Endpoints (Strict)
| Parameter | Value |
|-----------|-------|
| **TTL** | 1 minute (60,000 ms) |
| **Limit** | 5 requests per minute |
| **Purpose** | Prevent brute force login attacks |

### General API (Relaxed)
| Parameter | Value |
|-----------|-------|
| **TTL** | 1 hour (3,600,000 ms) |
| **Limit** | 100 requests per hour |
| **Purpose** | Prevent API abuse |

---

## 9. WebSocket (Configured but Not Implemented)

### Environment Variables Present
```env
VITE_WS_URL=ws://localhost:8080
```

### Current Status
- **Frontend**: Configuration exists but no active WebSocket implementation found
- **Backend**: No WebSocket gateway detected in modules

### Potential Use Cases
- Real-time SOP status updates
- Live collaboration notifications
- Evaluation assignment alerts
- TTE signing confirmations

---

## 10. Third-party Libraries with Network Access

### Libraries That May Make Network Calls
| Library | Purpose | Network Required |
|---------|---------|------------------|
| @tanstack/react-query | Data fetching | Yes (API calls) |
| msw | API mocking | No (development only) |
| @nestjs/swagger | API docs | No (self-hosted) |

### CDN Usage
- **None detected**: All assets served locally
- **Fonts**: Using system fonts (-apple-system, BlinkMacSystemFont, etc.)
- **Icons**: Lucide React (bundled, no CDN)

---

## 11. Security Integrations

### Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: Default (10)
- **Storage**: Hashed in Pengguna.kataSandi

### Input Validation
- **Library**: class-validator + class-transformer
- **Global Pipe**: ValidationPipe with whitelist: true
- **Zod**: Used for environment variable validation

### SQL Injection Prevention
- **ORM**: Prisma with parameterized queries
- **No Raw SQL**: Except for specific constraints (triggers, CHECK constraints)

### XSS Prevention
- **React**: Automatic JSX escaping
- **Sanitization**: No HTML sanitization library detected (not needed with React)

### CSRF Protection
- **Status**: Not explicitly implemented
- **Reason**: JWT in Authorization header (not cookies) avoids CSRF vulnerability

---

## 12. Monitoring & Observability

### Logging
| Component | Details |
|-----------|---------|
| **Framework** | Winston |
| **Format** | JSON (production-ready) |
| **Levels** | error, warn, info, debug |
| **Global Filter** | GlobalExceptionFilter captures all exceptions |

### Health Checks
| Endpoint | Response |
|----------|----------|
| `/health` | Basic health status |
| Docker healthcheck | `mysqladmin ping` for database |

### Error Boundaries
```typescript
process.on('uncaughtException', (err) => logger.error('Uncaught Exception:', err))
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason))
```

---

## 13. Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   React UI  │  │ TanStack     │  │  Zustand Store  │    │
│  │  (Radix +   │  │   Router     │  │                 │    │
│  │  Tailwind)  │  │   + Query    │  │                 │    │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘    │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                           │                                 │
│                    HTTP/JSON                                │
│                    (JWT Auth)                               │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   NestJS    │  │   Passport   │  │   Prisma ORM    │    │
│  │   Modules   │  │   + JWT      │  │                 │    │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘    │
│         │                │                    │             │
│  ┌──────┴────────────────┴────────────────────┴──────┐     │
│  │              Global Guards & Filters               │     │
│  │         (JwtAuthGuard, RolesGuard, Exception)      │     │
│  └───────────────────────┬───────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  MySQL 8.0                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ Pengguna │  │   SOP    │  │  PengajuanEval   │  │   │
│  │  │   OPD    │  │ Detail   │  │  NilaiEvaluasi   │  │   │
│  │  │ Peraturan│  │ Langkah  │  │  RiwayatTTE      │  │   │
│  │  │   Tim    │  │  Diagram │  │  LogAudit        │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Integration Checklist

### Active Integrations
- ✅ JWT Authentication (internal)
- ✅ MySQL Database (via Prisma)
- ✅ Docker Containerization
- ✅ Winston Logging
- ✅ Swagger Documentation
- ✅ Rate Limiting (Throttler)

### Configured but Not Active
- ⚠️ WebSocket (VITE_WS_URL configured, no implementation)
- ⚠️ Email Verification (flag exists, no SMTP service)

### Future Integration Opportunities
- ⭕ Email/SMTP service for notifications
- ⭕ Object storage (S3/MinIO) for attachments
- ⭕ National SSO for government login
- ⭕ Push notification service
- ⭕ Analytics/Monitoring (Prometheus, Grafana)
- ⭕ CI/CD pipeline integration

---

## 15. API Endpoints Overview

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register (if enabled)
- `POST /api/v1/auth/refresh` - Refresh token

### Core Modules
| Module | Base Path | Purpose |
|--------|-----------|---------|
| Users | `/api/v1/users` | User management |
| SOP | `/api/v1/sop` | SOP CRUD, workflow |
| Evaluasi | `/api/v1/evaluasi` | Evaluation workflow |
| OPD | `/api/v1/opd` | Organization management |
| Peraturan | `/api/v1/peraturan` | Regulation management |
| Tim | `/api/v1/tim` | Team management |
| TTE | `/api/v1/tte` | Digital signature |
| Audit | `/api/v1/audit` | Audit logs |
| Health | `/health` | Health check |

---

## 16. Data Flow

### SOP Creation Flow
```
User → Login → JWT → Create SOP → Save to DB → Log Audit
```

### SOP Evaluation Flow
```
Koordinator → Submit for Evaluation → Tim Evaluasi → 
  Nilai Evaluasi → Verifikasi Biro → TTE → SELESAI
```

### TTE Flow
```
User → Verify PIN → Generate Document Hash → 
  Sign with Private Key → Store RiwayatTandaTangan → 
  Return Signed Document
```
