# Technical Concerns & Risks

**Project**: Sistem Informasi SOP Biro Organisasi  
**Analysis Date**: 2026-04-03  
**Severity Levels**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🔴 Critical | 3 | Immediate attention (before production) |
| 🟠 High | 8 | Address within 1-2 sprints |
| 🟡 Medium | 12 | Plan for next quarter |
| 🟢 Low | 6 | Technical debt backlog |

**Overall Risk Assessment**: **MODERATE** - System has solid foundation but requires attention to critical issues before production deployment.

---

## 🔴 Critical Concerns

### C1: React 19 Compatibility Risks

**Severity**: 🔴 Critical  
**Location**: `client/package.json`  
**Impact**: Ecosystem compatibility, stability

**Issue**:
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

React 19 is a very recent major release. Potential issues:
- Third-party library compatibility may be incomplete
- Undiscovered bugs in production
- Testing library versions may not be fully optimized
- Migration from React 18 patterns may cause subtle issues

**Evidence**:
- Vitest config has workaround: `singleThread: true // Fix for React 19`
- Some testing patterns may need adjustment for React 19 behavior changes

**Recommended Action**:
```bash
# Option 1: Downgrade to stable React 18
pnpm add react@18.3.1 react-dom@18.3.1

# Option 2: If staying on React 19, add comprehensive E2E testing
```

**Timeline**: Before production deployment

---

### C2: Tailwind CSS v4 Breaking Changes

**Severity**: 🔴 Critical  
**Location**: `client/package.json`  
**Impact**: Build stability, CSS output

**Issue**:
```json
{
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18"
}
```

Tailwind CSS v4 introduces breaking changes:
- New engine (Oxide) with different behavior
- Changed configuration patterns
- Potential compatibility issues with existing plugins
- Migration from v3 requires careful testing

**Evidence**:
- Using `@tailwindcss/vite` plugin (v4 specific)
- Design system built on v4 may have undiscovered edge cases

**Recommended Action**:
1. Document all Tailwind v4 specific configurations
2. Test CSS output thoroughly across browsers
3. Consider downgrading to v3.4.x for production stability
4. Add visual regression testing

**Timeline**: Before production deployment

---

### C3: Missing Environment Variable Validation

**Severity**: 🔴 Critical  
**Location**: `server/src/config/env.validation.ts`  
**Impact**: Runtime failures, security

**Issue**:
While Zod validation exists for backend, critical validation gaps remain:

```typescript
// Current validation may not catch all edge cases
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... potentially missing critical vars
});
```

**Missing Validations**:
- Frontend environment variables (VITE_*) have no validation
- No runtime check for required variables
- No default value security audit

**Recommended Action**:
```typescript
// Add comprehensive env validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url().refine(
    url => url.includes('mysql://'),
    'Must be MySQL connection string'
  ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().refine(
    exp => /^\d+[smhd]$/.test(exp),
    'Must be in format: number + s/m/h/d'
  ),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',')),
});

// Validate at application startup
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error);
  process.exit(1);
}
```

**Timeline**: Before next deployment

---

## 🟠 High Priority Concerns

### H1: Insufficient Test Coverage

**Severity**: 🟠 High  
**Location**: `client/`, `server/`  
**Impact**: Regression risk, code quality

**Current State**:
```json
// Backend coverage thresholds (package.json)
"coverageThreshold": {
  "global": {
    "branches": 10,
    "functions": 20,
    "lines": 20,
    "statements": 20
  }
}

// Frontend coverage thresholds (vitest.config.ts)
thresholds: {
  global: {
    branches: 70,  // Good target but may not be enforced
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Issues**:
- Backend thresholds are extremely low (10-20%)
- Critical business logic may be untested
- No E2E testing implemented
- No integration testing for critical workflows

**Recommended Action**:
1. Increase backend thresholds to minimum 70%
2. Add tests for critical paths:
   - Authentication flow
   - SOP creation and approval workflow
   - TTE signing process
   - Evaluation submission
3. Implement E2E testing with Playwright
4. Add CI gate for coverage thresholds

**Timeline**: 2-3 sprints

---

### H2: Accessibility Issues (WCAG Non-Compliance)

**Severity**: 🟠 High  
**Location**: `client/src/components/`  
**Impact**: User exclusion, legal compliance

**Source**: UX-AUDIT-REPORT.md findings

**Critical Issues Found**:
```markdown
[CRITICAL]
1. Touch targets too small (32px vs required 44px)
   - Location: button.tsx (size: default = 'h-8')
   - Impact: Mobile users cannot reliably tap buttons

2. Missing form error associations
   - Location: LoginForm.tsx, TTEBuatDialog.tsx
   - Impact: Screen reader users cannot identify error fields
```

**High Issues Found**:
```markdown
[HIGH]
1. Color contrast insufficient (gray-400 on white = 3.0:1 ratio)
2. Small font sizes (12px base, WCAG recommends 14px minimum)
3. No skip-to-main-content link
4. Loading states inconsistent
5. Focus management in dialogs incomplete
6. Error messages generic (don't specify which field)
7. No aria-live regions for dynamic content
8. Table headers lack scope attribute
```

**Recommended Action**:
```typescript
// Immediate fixes (Phase 1)
// 1. Increase touch targets
button.tsx: size: default = 'h-11' // was 'h-8'

// 2. Associate error messages
<input aria-describedby={errors.email ? 'email-error' : undefined} />
{errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}

// 3. Fix color contrast
styles.css: --gray-400: #6B7280 // was #9CA3AF

// 4. Increase font size
styles.css: --font-body: 14px // was 12px
```

**Timeline**: Before production (accessibility is legal requirement)

---

### H3: Database Connection Pooling

**Severity**: 🟠 High  
**Location**: `docker-compose.yml`, `server/`  
**Impact**: Performance, scalability

**Issue**:
```yaml
# docker-compose.yml
environment:
  DATABASE_URL: mysql://root:password@db:3306/sop_db?connection_limit=10
```

**Problems**:
- Connection limit of 10 may be insufficient under load
- No connection pool monitoring
- No retry logic for connection failures
- Single database instance (no read replicas)

**Recommended Action**:
```typescript
// Add connection pool configuration in Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Monitor connection pool
setInterval(async () => {
  const stats = await prisma.$queryRaw`SHOW STATUS LIKE 'Threads_connected'`;
  logger.log(`Active connections: ${stats[0].Value}`);
}, 60000);
```

**Timeline**: Before production load testing

---

### H4: Rate Limiting Configuration

**Severity**: 🟠 High  
**Location**: `server/src/app.module.ts`  
**Impact**: Security, DoS protection

**Current Configuration**:
```typescript
const AUTH_THROTTLE_TTL_MS = 60 * 1000; // 1 minute
const AUTH_THROTTLE_LIMIT = 5; // 5 requests per minute

const GENERAL_THROTTLE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GENERAL_THROTTLE_LIMIT = 100; // 100 requests per hour
```

**Issues**:
- Auth limit (5/min) may be too strict for legitimate users
- No per-endpoint rate limiting customization
- No rate limit headers for clients
- No distributed rate limiting (fails in multi-instance deployment)

**Recommended Action**:
```typescript
// Add endpoint-specific rate limits
@Throttle('strict') // 3/minute for sensitive endpoints
@Post('login')
async login(@Body() dto: LoginDto) { ... }

@Throttle('moderate') // 30/minute for search
@Get('sop/search')
async search(@Query() query: SearchDto) { ... }

// Add rate limit headers
app.use((req, res, next) => {
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  res.setHeader('X-RateLimit-Reset', '1625097600');
  next();
});
```

**Timeline**: Before production

---

### H5: Error Handling Inconsistency

**Severity**: 🟠 High  
**Location**: `client/src/services/`, `server/src/modules/`  
**Impact**: User experience, debugging

**Issue**:
Inconsistent error handling patterns across codebase:

```typescript
// Some services throw structured errors
throw new NotFoundException('SOP not found');

// Others may throw raw errors
throw error; // Unstructured

// Frontend error handling varies
try {
  await sopService.create(data);
} catch (error) {
  // Sometimes handled
  uiStore.addToast({ type: 'error', title: 'Gagal' });
  
  // Sometimes not handled (silent failures)
}
```

**Recommended Action**:
```typescript
// Standardize error classes
export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Use consistently
throw new AppError('SOP_NOT_FOUND', 404, 'SOP tidak ditemukan');

// Global error handler
api.interceptors.response.use(
  response => response,
  error => {
    const appError = error.response?.data;
    uiStore.addToast({
      type: 'error',
      title: 'Error',
      description: appError?.message || 'Terjadi kesalahan',
    });
    throw error;
  }
);
```

**Timeline**: 1-2 sprints

---

### H6: Logging Security

**Severity**: 🟠 High  
**Location**: `server/src/common/logger/`  
**Impact**: Data privacy, compliance

**Issue**:
Winston logger configuration may log sensitive data:

```typescript
// Potential logging of sensitive information
logger.log(`Login attempt for: ${loginDto.email}, password: ${loginDto.password}`);
// DON'T DO THIS - but easy to accidentally add

// No PII filtering
logger.log(`User data: ${JSON.stringify(user)}`);
// May include kataSandi, token, etc.
```

**Recommended Action**:
```typescript
// Add sensitive data filter
const sensitiveFields = ['password', 'kataSandi', 'token', 'secret', 'apiKey'];

function filterSensitiveData(obj: any): any {
  const filtered = { ...obj };
  for (const key of sensitiveFields) {
    if (key in filtered) {
      filtered[key] = '[REDACTED]';
    }
  }
  return filtered;
}

// Use in logger
logger.log(`User data: ${JSON.stringify(filterSensitiveData(user))}`);
```

**Timeline**: Before production

---

### H7: Docker Security Configuration

**Severity**: 🟠 High  
**Location**: `docker-compose.yml`, `Dockerfile`  
**Impact**: Container security

**Issues**:
```yaml
# Running as root (default)
# No USER directive in Dockerfile

# Exposed ports without firewall rules
ports:
  - "3306:3306"  # MySQL directly exposed
  - "8080:3000"  # Server exposed

# No resource limits
# No health checks for server/client (only db)
```

**Recommended Action**:
```dockerfile
# Dockerfile - Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs
```

```yaml
# docker-compose.yml - Add security
services:
  server:
    user: "1001:1001"
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

**Timeline**: Before production

---

### H8: Dependency Vulnerabilities

**Severity**: 🟠 High  
**Location**: `client/package.json`, `server/package.json`  
**Impact**: Security

**Issue**:
No automated dependency scanning detected. Need to run:

```bash
# Check for vulnerabilities
pnpm audit
npm audit

# Check for outdated packages
pnpm outdated
npm outdated
```

**Recommended Action**:
1. Run `pnpm audit` on both client and server
2. Fix critical/high vulnerabilities immediately
3. Add automated dependency scanning to CI
4. Consider using Dependabot or Renovate

**Timeline**: Immediate

---

## 🟡 Medium Priority Concerns

### M1: No WebSocket Implementation

**Severity**: 🟡 Medium  
**Location**: `.env` (VITE_WS_URL configured)  
**Impact**: Feature gap

**Issue**:
```env
VITE_WS_URL=ws://localhost:8080
```

WebSocket URL is configured but no implementation found. Missing real-time features:
- Live SOP status updates
- Real-time collaboration notifications
- Instant evaluation assignment alerts

**Recommended Action**:
- Implement WebSocket gateway in NestJS
- Add WebSocket client hook in React
- Use for real-time notifications

**Timeline**: Future enhancement

---

### M2: No Email Service Integration

**Severity**: 🟡 Medium  
**Location**: `server/`  
**Impact**: User experience

**Issue**:
- `emailTerverifikasi` flag exists but no email sending
- No password reset functionality
- No notification emails for SOP status changes

**Recommended Action**:
```typescript
// Add email service
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email on SOP approval
await transporter.sendMail({
  from: 'SOP System <noreply@example.com>',
  to: user.email,
  subject: 'SOP Disetujui',
  text: `SOP ${sop.judul} telah disetujui`,
});
```

**Timeline**: Before production

---

### M3: No File Storage Strategy

**Severity**: 🟡 Medium  
**Location**: `server/src/modules/sop/`  
**Impact**: Scalability

**Issue**:
- Logo stored as base64 string in database
- No attachment storage implemented
- No CDN for static assets

**Recommended Action**:
```typescript
// Add S3/MinIO integration
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

// Upload file
await s3Client.send(new PutObjectCommand({
  Bucket: 'sop-attachments',
  Key: `${sopId}/${filename}`,
  Body: file.buffer,
}));
```

**Timeline**: Before production (if attachments needed)

---

### M4: No CSRF Protection

**Severity**: 🟡 Medium  
**Location**: `server/src/main.ts`  
**Impact**: Security (mitigated by JWT)

**Current State**:
```typescript
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  // No CSRF tokens
});
```

**Why It's Medium (Not High)**:
- JWT in Authorization header (not cookies) avoids CSRF vulnerability
- CORS is properly configured

**Recommended Action**:
- Document CSRF risk assessment
- Consider adding CSRF tokens if cookie-based auth added in future

**Timeline**: Document now, implement if auth changes

---

### M5: No Request Validation Logging

**Severity**: 🟡 Medium  
**Location**: `server/src/common/filters/`  
**Impact**: Security monitoring

**Issue**:
- Validation errors logged but not tracked
- No alerting for repeated validation failures
- No IP-based blocking for malicious requests

**Recommended Action**:
```typescript
// Add request logging middleware
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    
    logger.log(`${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`);
    next();
  }
}
```

**Timeline**: 1-2 sprints

---

### M6: No API Versioning Strategy

**Severity**: 🟡 Medium  
**Location**: `server/src/main.ts`  
**Impact**: Future compatibility

**Current State**:
```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

**Issue**:
- Only v1 exists
- No deprecation strategy documented
- No versioning for breaking changes

**Recommended Action**:
- Document API versioning strategy
- Add sunset headers for deprecated versions
- Plan v2 for breaking changes

**Timeline**: Document now

---

### M7: No Database Backup Strategy

**Severity**: 🟡 Medium  
**Location**: `docker-compose.yml`  
**Impact**: Data loss risk

**Issue**:
```yaml
volumes:
  - db_data:/var/lib/mysql
```

No automated backup configured.

**Recommended Action**:
```yaml
# Add backup service
services:
  backup:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql:ro
      - ./backups:/backups
    command: >
      sh -c '
        while true; do
          mysqldump -u root -p$$DB_ROOT_PASSWORD sop_db > /backups/sop_db-$$(date +%Y%m%d).sql
          sleep 86400
        done
      '
```

**Timeline**: Before production

---

### M8: No Health Check for Server/Client

**Severity**: 🟡 Medium  
**Location**: `docker-compose.yml`  
**Impact**: Reliability

**Current State**:
```yaml
services:
  db:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
  
  server:
    # No healthcheck
  
  client:
    # No healthcheck
```

**Recommended Action**:
```yaml
services:
  server:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  client:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Timeline**: Before production

---

### M9: No Graceful Shutdown for Client

**Severity**: 🟡 Medium  
**Location**: `server/src/main.ts`  
**Impact**: Data integrity

**Current State**:
```typescript
app.enableShutdownHooks(); // Server only
```

**Recommended Action**:
- Document graceful shutdown procedures
- Add shutdown hooks for cleanup tasks
- Ensure database connections close properly

**Timeline**: Before production

---

### M10: No Performance Monitoring

**Severity**: 🟡 Medium  
**Location**: `server/`, `client/`  
**Impact**: Performance optimization

**Issue**:
- No APM (Application Performance Monitoring)
- No query performance tracking
- No frontend performance metrics

**Recommended Action**:
```typescript
// Add performance logging
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const req = context.switchToHttp().getRequest();
        logger.log(`${req.method} ${req.url} - ${duration}ms`);
      }),
    );
  }
}
```

**Timeline**: Before production

---

### M11: No Input Sanitization

**Severity**: 🟡 Medium  
**Location**: `server/src/common/pipes/`  
**Impact**: XSS, injection attacks

**Current State**:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

**Issue**:
- Validation exists but no sanitization
- HTML/JS injection possible in text fields

**Recommended Action**:
```typescript
import * as DOMPurify from 'isomorphic-dompurify';

// Add sanitization pipe
@IsString()
@Transform(({ value }) => DOMPurify.sanitize(value))
judul: string;
```

**Timeline**: Before production

---

### M12: No API Documentation Updates

**Severity**: 🟡 Medium  
**Location**: `server/src/`  
**Impact**: Developer experience

**Issue**:
- Swagger enabled but may be outdated
- No automated API documentation updates
- No API changelog

**Recommended Action**:
```typescript
// Ensure all endpoints have proper decorators
@ApiOperation({ summary: 'Create new SOP' })
@ApiBody({ type: CreateSopDto })
@ApiBearerAuth()
@Roles(PeranPengguna.TIM_PENYUSUN)
@Post()
create(@Body() dto: CreateSopDto) { ... }
```

**Timeline**: Ongoing

---

## 🟢 Low Priority Concerns

### L1: Inconsistent Button Gap

**Severity**: 🟢 Low  
**Location**: `client/src/components/ui/button.tsx`  
**Impact**: Visual consistency

**Issue**:
```typescript
// Some buttons have gap-1.5, others gap-2
gap: 'gap-1.5' | 'gap-2' // Inconsistent
```

**Recommended Action**: Standardize to `gap-2`

**Timeline**: Next UI refactor

---

### L2: No Dark Mode Support

**Severity**: 🟢 Low  
**Location**: `client/src/styles.css`  
**Impact**: User preference

**Issue**:
- Design system only supports light theme
- No `prefers-color-scheme` support

**Timeline**: Future enhancement

---

### L3: Placeholder Text Disappears

**Severity**: 🟢 Low  
**Location**: Input components  
**Impact**: UX

**Issue**:
- Placeholders vanish on focus
- Users may forget field purpose

**Timeline**: UX improvement backlog

---

### L4: Toast Auto-Dismiss Too Fast

**Severity**: 🟢 Low  
**Location**: `client/src/stores/uiStore.ts`  
**Impact**: User awareness

**Issue**:
```typescript
// 3 second auto-dismiss may be too quick
setTimeout(() => removeToast(toast.id), 3000);
```

**Recommended Action**: Increase to 5 seconds

**Timeline**: Quick fix

---

### L5: No Print Styles for All Pages

**Severity**: 🟢 Low  
**Location**: `client/src/styles.css`  
**Impact**: Printing

**Issue**:
- Only SOP preview has print styles
- Other pages don't print well

**Timeline**: Future enhancement

---

### L6: Inconsistent Error Message Placement

**Severity**: 🟢 Low  
**Location**: Dialog components  
**Impact**: UX consistency

**Issue**:
- Sometimes inline, sometimes in dialog header

**Timeline**: UI refactor

---

## Risk Mitigation Summary

### Immediate Actions (Before Production)
1. ✅ Fix React 19 compatibility or downgrade to React 18
2. ✅ Fix Tailwind CSS v4 issues or downgrade to v3
3. ✅ Add comprehensive environment variable validation
4. ✅ Fix accessibility critical issues (touch targets, error associations)
5. ✅ Implement database backup strategy
6. ✅ Add health checks for all services
7. ✅ Run dependency audit and fix vulnerabilities

### Short-Term (1-2 Sprints)
1. Increase test coverage to 70%+
2. Fix accessibility high-priority issues
3. Implement proper error handling patterns
4. Add logging security filters
5. Improve Docker security configuration
6. Add rate limiting customization

### Medium-Term (Next Quarter)
1. Implement email service integration
2. Add file storage strategy
3. Implement performance monitoring
4. Add input sanitization
5. Implement WebSocket for real-time features
6. Add API documentation automation

---

## Technical Debt Tracker

| ID | Concern | Severity | Status | Owner | Due Date |
|----|---------|----------|--------|-------|----------|
| C1 | React 19 Compatibility | 🔴 | Open | - | Before prod |
| C2 | Tailwind CSS v4 Issues | 🔴 | Open | - | Before prod |
| C3 | Env Validation | 🔴 | Open | - | Before prod |
| H1 | Test Coverage | 🟠 | Open | - | Sprint 1-2 |
| H2 | Accessibility | 🟠 | Open | - | Before prod |
| H3 | Connection Pooling | 🟠 | Open | - | Before prod |
| H4 | Rate Limiting | 🟠 | Open | - | Before prod |
| H5 | Error Handling | 🟠 | Open | - | Sprint 1-2 |
| H6 | Logging Security | 🟠 | Open | - | Before prod |
| H7 | Docker Security | 🟠 | Open | - | Before prod |
| H8 | Dependency Audit | 🟠 | Open | - | Immediate |

---

## Conclusion

The codebase demonstrates solid architectural foundations with modern technology choices. However, several critical issues must be addressed before production deployment:

1. **React 19 and Tailwind v4** - Consider downgrading to more stable versions
2. **Accessibility** - Critical WCAG violations must be fixed
3. **Security** - Environment validation, logging security, Docker hardening
4. **Testing** - Increase coverage, especially for critical workflows

With proper attention to these concerns, the system will be production-ready with good maintainability and security posture.
