# Coding Conventions

**Project**: Sistem Informasi SOP Biro Organisasi  
**Languages**: TypeScript (Frontend + Backend), React, NestJS

---

## 1. Code Style

### ESLint Configuration

**Backend** (`eslint.config.mjs`):
```typescript
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
```

**Key Rules**:
- `no-explicit-any`: Off (Prisma types sometimes require `any`)
- `no-floating-promises`: Warn (must await async functions)
- `no-unsafe-argument`: Warn (type safety for function arguments)
- `prettier/prettier`: Error with auto line ending (Windows/Unix compatible)

### Prettier Configuration

**Backend** (`.prettierrc` - inferred from usage):
- End of line: `auto` (respects OS)
- Single quotes: Yes (TypeScript convention)
- Trailing commas: ES5 (objects/arrays)
- Print width: 80-100 (implied from code)
- Tab width: 2 spaces

**Frontend**: Uses default Vite/React conventions

---

## 2. TypeScript Patterns

### Strictness Levels

**Frontend** (Strict):
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

**Backend** (Moderate):
```json
{
  "strictNullChecks": true,
  "noImplicitAny": false,
  "strictBindCallApply": false,
  "noFallthroughCasesInSwitch": false
}
```

### Type Definitions Pattern

**Interface for DTOs**:
```typescript
// Backend
export class CreateSopDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsNotEmpty()
  opdId: string;
}

// Frontend
export interface SOP {
  id: string;
  judul: string;
  opdId: string;
  createdAt: string;
  updatedAt: string;
}
```

**Type for API Responses**:
```typescript
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Utility Types Usage
```typescript
// Partial update DTO
export class UpdateSopDto extends PartialType(CreateSopDto) {}

// Pick specific fields
type SopSummary = Pick<SOP, 'id' | 'judul' | 'createdAt'>;

// Omit sensitive fields
type PublicUser = Omit<Pengguna, 'kataSandi' | 'deletedAt'>;

// Readonly for constants
const VALID_TRANSITIONS: Readonly<Record<StatusSOP, StatusSOP[]>> = { ... }
```

---

## 3. Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SopForm.tsx`, `LoginForm.tsx` |
| Feature folders | kebab-case | `tim-penyusun/`, `manajemen-sop/` |
| Services | camelCase + suffix | `sopService.ts`, `authService.ts` |
| Hooks | camelCase with `use` | `useAuth.ts`, `useSOP.ts` |
| Stores | camelCase + Store | `uiStore.ts`, `authStore.ts` |
| Types | camelCase | `sop.ts`, `evaluasi.ts` |
| Utils | camelCase | `cn.ts`, `formatDate.ts` |
| NestJS modules | kebab-case | `auth.module.ts`, `sop.module.ts` |
| NestJS controllers | kebab-case | `auth.controller.ts` |
| NestJS services | kebab-case | `auth.service.ts` |
| NestJS DTOs | kebab-case | `create-user.dto.ts` |
| Test files | `*.spec.ts` or `*.test.ts` | `auth.service.spec.ts` |

### Variables & Functions

```typescript
// Variables: camelCase
const currentUser = ...;
const sopList = ...;

// Constants: UPPER_SNAKE_CASE
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_RETRY_COUNT = 3;

// Functions: camelCase
async function createSOP(dto: CreateSOPDto) { ... }
function formatDate(date: Date): string { ... }

// Classes: PascalCase
class JwtAuthGuard { ... }
class SopService { ... }

// Enums: PascalCase with UPPER_CASE values
enum StatusSOP {
  DRAFT = 'DRAFT',
  BERLAKU = 'BERLAKU',
}

// Types/Interfaces: PascalCase
interface UserPayload {
  sub: string;
  email: string;
  peran: PeranPengguna;
}
```

### Database Entities

```typescript
// Prisma models: PascalCase (Indonesian)
model Pengguna { ... }
model DetailSOP { ... }

// Fields: camelCase (Indonesian)
id String @id @default(uuid())
email String @unique
nama String
kataSandi String
createdAt DateTime @default(now())
deletedAt DateTime?
```

---

## 4. Import Organization

### Import Order

```typescript
// 1. Node.js built-in modules
import { join } from 'path';

// 2. Third-party libraries
import { Module } from '@nestjs/common';
import { PrismaService } from '@prisma/client';
import React, { useState } from 'react';

// 3. Absolute imports (project modules)
import { PrismaService } from 'common/prisma/prisma.service';
import { Button } from '@/components/ui/button';

// 4. Relative imports
import { AuthService } from './auth.service';
import { LoginForm } from '../components/LoginForm';

// 5. Type imports (grouped separately or with their modules)
import type { UserPayload } from '../types/user';
import type { CreateSopDto } from './dto/create-sop.dto';
```

### Import Patterns

**Frontend**:
```typescript
// React & hooks
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Icons (named imports)
import { Search, Plus, Edit, Trash2, X, Check } from 'lucide-react';

// Services
import { sopService } from '@/services/sopService';

// Stores
import { useUIStore } from '@/stores/uiStore';

// Types
import type { SOP, CreateSOPDto } from '@/types/sop';

// Utils
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
```

**Backend**:
```typescript
// NestJS decorators
import { Module, Injectable, Controller, Get, Post, Body } from '@nestjs/common';

// NestJS common
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// Prisma
import { Prisma, Pengguna } from '@prisma/client';

// Local modules
import { PrismaService } from 'common/prisma/prisma.service';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
```

---

## 5. Error Handling Patterns

### Backend Error Handling

**Service Layer**:
```typescript
@Injectable()
export class SopService {
  async findOne(id: string) {
    const sop = await this.prisma.sop.findUnique({ where: { id } });
    
    if (!sop) {
      throw new NotFoundException(`SOP dengan ID ${id} tidak ditemukan`);
    }
    
    return sop;
  }

  async create(dto: CreateSopDto, userId: string) {
    try {
      return await this.prisma.sop.create({ data: dto });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        throw new ConflictException('SOP dengan nomor ini sudah ada');
      }
      if (error.code === 'P2003') {
        // Foreign key constraint failed
        throw new BadRequestException('OPD ID tidak valid');
      }
      throw error; // Let global filter handle
    }
  }
}
```

**Controller Layer**:
```typescript
@Controller('api/v1/sop')
export class SopController {
  constructor(private sopService: SopService) {}

  @Get(':id')
  @ApiResponse({ status: 200, type: SOP })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  async findOne(@Param('id') id: string) {
    return this.sopService.findOne(id);
  }
}
```

**Global Exception Filter**:
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Frontend Error Handling

**API Service**:
```typescript
// Axios instance with interceptor
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      authStore.clearAuth();
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      uiStore.addToast({
        type: 'error',
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk mengakses resource ini',
      });
    }

    // Extract error message
    const message = error.response?.data?.message || 'Terjadi kesalahan';
    throw { ...error, message };
  }
);
```

**Component Error Handling**:
```typescript
function SopForm() {
  const mutation = useMutation({
    mutationFn: sopService.create,
    onSuccess: () => {
      uiStore.addToast({
        type: 'success',
        title: 'Berhasil',
        description: 'SOP berhasil dibuat',
      });
      navigate({ to: '/sop' });
    },
    onError: (error) => {
      uiStore.addToast({
        type: 'error',
        title: 'Gagal',
        description: error.message,
      });
    },
  });

  const handleSubmit = async (data: CreateSOPDto) => {
    mutation.mutate(data);
  };

  // ...
}
```

---

## 6. Logging Conventions

### Backend Logging (Winston)

**Logger Configuration**:
```typescript
// Development: Colored console output
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

**Usage in Services**:
```typescript
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(loginDto: LoginDto) {
    this.logger.debug(`Login attempt for email: ${loginDto.email}`);
    
    const user = await this.prisma.pengguna.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed - user not found: ${loginDto.email}`);
      throw new UnauthorizedException('Email atau password salah');
    }

    // ... validate password, generate token

    this.logger.log(`User logged in: ${user.email} (${user.peran})`);
    return { accessToken, refreshToken };
  }
}
```

**Log Levels**:
- `error`: Exceptions, failures (always logged)
- `warn`: Unexpected but handled issues
- `log`: Important business events (login, create, update)
- `debug`: Detailed debugging info (development only)

---

## 7. Commenting Standards

### File Headers (Optional)
```typescript
/**
 * SOP Service
 * Handles business logic for SOP management
 * 
 * @module modules/sop
 */
```

### JSDoc for Public Methods
```typescript
/**
 * Creates a new SOP document
 * 
 * @param dto - SOP creation data
 * @param userId - ID of user creating the SOP
 * @returns Created SOP detail with status DRAFT
 * @throws ConflictException if SOP number already exists
 * @throws BadRequestException if validation fails
 */
async create(dto: CreateSopDto, userId: string): Promise<DetailSOP> {
  // ...
}
```

### Inline Comments
```typescript
// Good: Explains WHY, not WHAT
// Using transaction to ensure atomic operation
await this.prisma.$transaction(async (tx) => {
  // Create SOP header first
  const sop = await tx.sop.create({ data: dto });
  
  // Create initial draft version
  const detail = await tx.detailSOP.create({
    data: { sopId: sop.id, status: 'DRAFT' },
  });
  
  return detail;
});

// Bad: Redundant comment
// Increment version
version: { increment: 1 },
```

### TODO Comments
```typescript
// TODO: Add email notification when SOP status changes
// FIXME: Handle race condition in concurrent submissions
// HACK: Temporary workaround for Prisma relation issue
// XXX: Security concern - needs review
```

---

## 8. React Patterns

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types
interface SopListProps {
  filter?: SopFilter;
}

// 3. Component
export function SopList({ filter }: SopListProps) {
  // 4. Hooks (in order)
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['sop', filter],
    queryFn: () => sopService.list(filter),
  });

  // 5. Event handlers
  const handleEdit = (id: string) => {
    navigate({ to: '/sop/$id/edit', params: { id } });
  };

  // 6. Render
  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
      {data.map((sop) => (
        <SopCard key={sop.id} sop={sop} onEdit={handleEdit} />
      ))}
    </div>
  );
}
```

### Custom Hooks Pattern
```typescript
interface UseSopReturn {
  sops: SOP[];
  isLoading: boolean;
  createSop: (dto: CreateSopDto) => Promise<void>;
  updateSop: (id: string, dto: UpdateSopDto) => Promise<void>;
  deleteSop: (id: string) => Promise<void>;
}

export function useSop(): UseSopReturn {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: sops = [], isLoading } = useSuspenseQuery({
    queryKey: ['sop'],
    queryFn: sopService.list,
  });

  const createMutation = useMutation({
    mutationFn: sopService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sop'] });
      addToast({ type: 'success', title: 'SOP berhasil dibuat' });
    },
  });

  return {
    sops,
    isLoading,
    createSop: createMutation.mutateAsync,
    // ...
  };
}
```

---

## 9. Testing Conventions

### Test File Structure
```typescript
// Arrange-Act-Assert pattern
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, MockPrismaService],
    }).compile();

    service = module.get(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: '1', email: loginDto.email, peran: 'TIM_PENYUSUN' };
      
      jest.spyOn(prisma.pengguna, 'findUnique').mockResolvedValue(mockUser as any);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.pengguna.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      // Arrange
      jest.spyOn(prisma.pengguna, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login({ email: 'invalid', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
```

### Test Naming Convention
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should return expected value when condition is met', async () => {
      // ...
    });

    it('should throw ExceptionType when validation fails', async () => {
      // ...
    });

    it('should call repository with correct parameters', async () => {
      // ...
    });
  });
});
```

---

## 10. Git Conventions

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes

**Examples**:
```
feat(sop): add diagram editor component
fix(auth): resolve JWT expiration handling
docs: update API documentation
refactor(users): extract validation logic to service
test(evaluasi): add unit tests for evaluation service
chore: update Prisma to version 7.5.0
```

### Branch Naming
```
feature/sop-diagram-editor
fix/login-validation
refactor/auth-module
docs/api-update
```

---

## 11. Design System Conventions

### Component Variants (class-variance-authority)
```typescript
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white hover:bg-blue-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-200 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        default: 'h-8 px-3 text-xs',
        sm: 'h-7 px-2 text-[10px]',
        lg: 'h-10 px-4 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Tailwind Class Order
```typescript
// Convention: Group by category
className="
  // Layout
  flex items-center justify-between
  
  // Sizing
  h-8 w-full
  
  // Spacing
  px-3 py-2 gap-2
  
  // Typography
  text-xs font-medium text-gray-700
  
  // Visual
  bg-white border border-gray-200 rounded-md
  
  // Interactive
  hover:bg-gray-50 transition-all
  
  // State
  disabled:opacity-50 disabled:cursor-not-allowed
  
  // Focus
  focus:outline-none focus:ring-1 focus:ring-blue-500
"
```

---

## 12. Security Conventions

### Password Handling
```typescript
// Hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, hashedPassword);

// NEVER store plain text passwords
// NEVER log passwords
```

### JWT Best Practices
```typescript
// Token generation
const payload = {
  sub: user.id,
  email: user.email,
  peran: user.peran,
};

const accessToken = this.jwtService.sign(payload, {
  expiresIn: process.env.JWT_EXPIRATION, // 15m
});

// Token validation (guard)
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.JWT_SECRET,
});
```

### Input Validation
```typescript
// Always validate input with class-validator
export class CreateSopDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  judul: string;

  @IsString()
  @IsUUID()
  opdId: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
```

---

## 13. Performance Conventions

### Database Query Optimization
```typescript
// Use select to limit returned fields
const users = await prisma.pengguna.findMany({
  select: {
    id: true,
    email: true,
    nama: true,
    peran: true,
  },
});

// Use include for relations (avoid N+1)
const sops = await prisma.sop.findMany({
  include: {
    detailSops: {
      where: { status: 'BERLAKU' },
      select: { id: true, versi: true },
    },
  },
});

// Use pagination
const items = await prisma.sop.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### Frontend Optimization
```typescript
// Use Suspense for loading states
const { data } = useSuspenseQuery({
  queryKey: ['sop', id],
  queryFn: () => sopService.getById(id),
});

// Use select for data transformation
const { data } = useQuery({
  queryKey: ['sop-names'],
  queryFn: async () => {
    const sops = await sopService.list();
    return sops.map(s => ({ label: s.judul, value: s.id }));
  },
});

// Use staleTime for caching
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: userService.me,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 14. Accessibility Conventions

### Component Accessibility
```typescript
// Icon buttons need aria-label
<button aria-label="Delete SOP" onClick={handleDelete}>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>

// Form inputs need labels
<label htmlFor="email" className="label">
  Email
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-red-600 text-xs">
    {errors.email.message}
  </p>
)}

// Dialogs need proper roles
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
  <Description id="dialog-description">
    Are you sure you want to delete this SOP?
  </Description>
</Dialog>
```

---

## 15. Quick Reference

### DO's ✓
- Use TypeScript strict mode (frontend)
- Validate all input with decorators
- Use async/await for async operations
- Handle errors with try-catch or .catch()
- Use meaningful variable names
- Add JSDoc for public methods
- Use ESLint and Prettier
- Write tests for business logic
- Use transaction for atomic operations
- Log important business events

### DON'Ts ✗
- Don't use `any` type (use `unknown` if needed)
- Don't skip error handling
- Don't log sensitive data (passwords, tokens)
- Don't use magic numbers (use constants)
- Don't write long functions (max 50 lines)
- Don't nest too deep (max 3 levels)
- Don't commit `.env` files
- Don't disable ESLint rules without reason
- Don't use `console.log` in production code
- Don't ignore TypeScript errors
