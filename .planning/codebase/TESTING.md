# Testing Strategy

**Project**: Sistem Informasi SOP Biro Organisasi  
**Frameworks**: Vitest (Frontend), Jest (Backend)

---

## 1. Testing Overview

### Test Pyramid
```
           /\
          /  \
         / E2E \        ~10% - Critical user flows
        /--------\
       /Integration\     ~20% - Service layer, API integration
      /--------------\
     /    Unit Tests    \  ~70% - Components, services, utilities
    /--------------------\
```

### Testing Tools

| Layer | Framework | Purpose |
|-------|-----------|---------|
| Frontend Unit | Vitest + React Testing Library | Component & hook tests |
| Frontend E2E | (Future: Playwright/Cypress) | Browser automation |
| Backend Unit | Jest | Service & controller tests |
| Backend E2E | Jest + Supertest | API endpoint tests |
| Mocking | MSW (frontend), Jest mocks (backend) | API simulation |

---

## 2. Frontend Testing (Vitest)

### Configuration

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/__tests__/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.tanstack', 'src/routes', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    poolOptions: {
      threads: {
        singleThread: true, // Fix for React 19
      },
    },
  },
});
```

### Test Setup

**src/__tests__/setup.ts**:
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

### Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-500');
  });
});
```

### Hook Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.value.isAuthenticated).toBe(false);
    expect(result.value.user).toBeNull();
  });

  it('updates state on login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.value.login({ email: 'test@example.com', password: 'password' });
    });
    
    expect(result.value.isAuthenticated).toBe(true);
    expect(result.value.user).toEqual({
      email: 'test@example.com',
      // ...
    });
  });
});
```

### Service Testing with MSW

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { sopService } from './sopService';

const server = setupServer(
  http.get('/api/v1/sop', () => {
    return HttpResponse.json({
      data: [
        { id: '1', judul: 'SOP 1', opdId: 'opd1' },
        { id: '2', judul: 'SOP 2', opdId: 'opd1' },
      ],
    });
  }),
  
  http.post('/api/v1/sop', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: '1', ...body },
      status: 201,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('sopService', () => {
  it('fetches SOP list', async () => {
    const sops = await sopService.list();
    
    expect(sops).toHaveLength(2);
    expect(sops[0].judul).toBe('SOP 1');
  });

  it('creates new SOP', async () => {
    const newSop = { judul: 'New SOP', opdId: 'opd1' };
    const result = await sopService.create(newSop);
    
    expect(result.data.judul).toBe('New SOP');
  });
});
```

### Test File Organization

```
client/src/
├── __tests__/
│   ├── setup.ts
│   ├── mocks/
│   │   └── handlers.ts
│   └── utils/
│       └── render.tsx
├── components/
│   ├── ui/
│   │   ├── __tests__/
│   │   │   ├── button.test.tsx
│   │   │   ├── input.test.tsx
│   │   │   └── dialog.test.tsx
│   │   └── button.tsx
│   └── sop/
│       ├── __tests__/
│       │   ├── SopForm.test.tsx
│       │   └── SopList.test.tsx
│       └── SopForm.tsx
├── hooks/
│   ├── __tests__/
│   │   ├── useAuth.test.ts
│   │   └── useSOP.test.ts
│   └── useAuth.ts
└── services/
    ├── __tests__/
    │   ├── sopService.test.ts
    │   └── authService.test.ts
    └── sopService.ts
```

---

## 3. Backend Testing (Jest)

### Configuration

**package.json** (Jest config):
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.spec.ts",
      "!**/node_modules/**",
      "!**/dist/**",
      "!**/generated/**"
    ],
    "coverageDirectory": "../coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "coverageThreshold": {
      "global": {
        "branches": 10,
        "functions": 20,
        "lines": 20,
        "statements": 20
      }
    },
    "testEnvironment": "node",
    "verbose": true,
    "testTimeout": 30000
  }
}
```

### Unit Testing Pattern

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'common/prisma/prisma.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    pengguna: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: '1',
      email: loginDto.email,
      nama: 'Test User',
      peran: 'TIM_PENYUSUN',
      kataSandi: await bcrypt.hash('password123', 10),
    };

    it('should return tokens on valid credentials', async () => {
      // Arrange
      mockPrisma.pengguna.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mocked-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.pengguna.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockPrisma.pengguna.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email atau password salah',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockPrisma.pengguna.findUnique.mockResolvedValue({
        ...mockUser,
        kataSandi: 'wrong-hash',
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      nama: 'New User',
      nip: '123456',
      peran: 'TIM_PENYUSUN' as const,
    };

    it('should create new user and return tokens', async () => {
      // Arrange
      mockPrisma.pengguna.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.pengguna.create.mockResolvedValue({
        id: '1',
        ...registerDto,
        kataSandi: expect.any(String),
      });
      mockJwtService.sign.mockReturnValue('mocked-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(prisma.pengguna.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerDto.email,
            nama: registerDto.nama,
          }),
        }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockPrisma.pengguna.findUnique.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email sudah terdaftar',
      );
    });
  });
});
```

### Service Testing with Mocks

```typescript
// sop.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'common/prisma/prisma.service';
import { SopService } from './sop.service';

describe('SopService', () => {
  let service: SopService;
  let prisma: PrismaService;

  const mockPrisma = {
    sop: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    detailSOP: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (fn) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SopService>(SopService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    const createDto = {
      judul: 'Test SOP',
      opdId: 'opd-1',
    };

    const userId = 'user-1';

    it('should create SOP with initial draft DetailSOP', async () => {
      // Arrange
      const mockSop = { id: 'sop-1', ...createDto };
      const mockDetail = {
        id: 'detail-1',
        sopId: 'sop-1',
        status: 'DRAFT',
        versi: 1,
      };

      mockPrisma.sop.create.mockResolvedValue(mockSop);
      mockPrisma.detailSOP.create.mockResolvedValue(mockDetail);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        return fn(mockPrisma);
      });

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(mockDetail);
      expect(prisma.sop.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(prisma.detailSOP.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sopId: 'sop-1',
          status: 'DRAFT',
          dibuatOlehId: userId,
        }),
      });
    });
  });

  describe('findOne', () => {
    it('should return SOP when found', async () => {
      // Arrange
      const mockSop = {
        id: 'sop-1',
        judul: 'Test SOP',
        detailSops: [{ id: 'detail-1', status: 'DRAFT' }],
      };
      mockPrisma.sop.findUnique.mockResolvedValue(mockSop);

      // Act
      const result = await service.findOne('sop-1');

      // Assert
      expect(result).toEqual(mockSop);
    });

    it('should throw NotFoundException when SOP not found', async () => {
      // Arrange
      mockPrisma.sop.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### E2E Testing Pattern

**test/app.e2e-spec.ts**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.pengguna.deleteMany();
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should register new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          nama: 'Test User',
          nip: '123456',
          peran: 'TIM_PENYUSUN',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          nama: 'Test User',
          nip: '123456',
          peran: 'TIM_PENYUSUN',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      // Create user first
      await prisma.pengguna.create({
        data: {
          email: 'duplicate@example.com',
          password: 'hashed',
          nama: 'Existing User',
          nip: '123456',
          peran: 'TIM_PENYUSUN',
        },
      });

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          nama: 'Test User',
          nip: '654321',
          peran: 'TIM_PENYUSUN',
        })
        .expect(409);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.pengguna.create({
        data: {
          email: 'test@example.com',
          password: await require('bcrypt').hash('password123', 10),
          nama: 'Test User',
          nip: '123456',
          peran: 'TIM_PENYUSUN',
        },
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });
  });
});
```

---

## 4. Test Coverage

### Coverage Thresholds

**Frontend** (vitest.config.ts):
```typescript
coverage: {
  thresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

**Backend** (package.json):
```json
"coverageThreshold": {
  "global": {
    "branches": 10,
    "functions": 20,
    "lines": 20,
    "statements": 20
  }
}
```

### Coverage Reports

**Generate coverage report**:
```bash
# Frontend
pnpm test -- --coverage

# Backend
pnpm test:cov
```

**Coverage output**: `coverage/`
- `index.html`: Interactive HTML report
- `lcov.info`: LCOV format for CI integration
- `coverage-final.json`: JSON summary

---

## 5. Mocking Patterns

### Frontend Mocking

**MSW Handlers** (mocks/handlers.ts):
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh-token',
        user: {
          id: '1',
          email,
          nama: 'Test User',
          peran: 'TIM_PENYUSUN',
        },
      });
    }
    
    return HttpResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 },
    );
  }),

  // SOP
  http.get('/api/v1/sop', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          judul: 'SOP Test 1',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),

  http.post('/api/v1/sop', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { data: { id: '1', ...body } },
      { status: 201 },
    );
  }),
];
```

**Test Setup with MSW**:
```typescript
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Backend Mocking

**Mock Prisma Service**:
```typescript
// test/mocks/prisma.mock.ts
export const createMockPrisma = () => ({
  pengguna: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  sop: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  detailSOP: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(async (fn) => fn(createMockPrisma())),
  $disconnect: jest.fn(),
  $connect: jest.fn(),
});
```

**Mock JWT Service**:
```typescript
// test/mocks/jwt.mock.ts
export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verifyAsync: jest.fn().mockReturnValue({
    sub: 'user-id',
    email: 'test@example.com',
    peran: 'TIM_PENYUSUN',
  }),
});
```

---

## 6. Test Utilities

### Custom Render (Frontend)

```typescript
// __tests__/utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const queryClient = options.queryClient || createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export everything
export * from '@testing-library/react';
```

### Test Data Factory

```typescript
// __tests__/utils/factories.ts
import { faker } from '@faker-js/faker';

export const createTestUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  nama: faker.person.fullName(),
  nip: faker.string.numeric(10),
  peran: 'TIM_PENYUSUN' as const,
  ...overrides,
});

export const createTestSOP = (overrides = {}) => ({
  id: faker.string.uuid(),
  judul: faker.lorem.sentence(),
  opdId: faker.string.uuid(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

export const createTestDetailSOP = (overrides = {}) => ({
  id: faker.string.uuid(),
  sopId: faker.string.uuid(),
  status: 'DRAFT' as const,
  versi: 1,
  nomorSOP: faker.string.alphanumeric(10),
  ...overrides,
});
```

---

## 7. Running Tests

### Test Commands

```bash
# Frontend
pnpm test                    # Run all tests
pnpm test -- --watch         # Watch mode
pnpm test -- --coverage      # With coverage
pnpm test src/components     # Test specific directory

# Backend
pnpm test                    # Run unit tests
pnpm test:watch              # Watch mode
pnpm test:cov                # With coverage
pnpm test:e2e                # E2E tests
pnpm test:debug              # Debug mode
```

### Test Scripts

**package.json**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## 8. CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpassword
          MYSQL_DATABASE: test_db
        options: >-
          --health-cmd "mysqladmin ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run frontend tests
        run: pnpm test --prefix client -- --coverage
      
      - name: Run backend tests
        run: pnpm test --prefix server -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./client/coverage/lcov.info,./server/coverage/lcov.info
```

---

## 9. Testing Best Practices

### DO's ✓
- Write tests before fixing bugs (regression tests)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests independent and isolated
- Mock external dependencies
- Test edge cases and error scenarios
- Use test factories for consistent data
- Clean up after tests (database, mocks)
- Run tests in CI pipeline

### DON'Ts ✗
- Don't test implementation details
- Don't write tests that depend on each other
- Don't skip tests without reason
- Don't test third-party libraries
- Don't use real API calls in unit tests
- Don't test multiple things in one test
- Don't ignore failing tests
- Don't commit without running tests

---

## 10. Test Coverage Areas

### Frontend Coverage

| Component | Priority | Status |
|-----------|----------|--------|
| UI Components (Button, Input, Dialog) | High | ✅ Tested |
| Forms (Login, SOP, Evaluasi) | High | ⭕ Needs tests |
| Custom Hooks (useAuth, useSOP) | High | ⭕ Needs tests |
| Services (API calls) | High | ⭕ Needs tests |
| Pages/Routes | Medium | ⭕ Needs tests |
| Layout Components | Low | ⭕ Needs tests |

### Backend Coverage

| Module | Priority | Status |
|--------|----------|--------|
| Auth Service | High | ✅ Tested |
| SOP Service | High | ⭕ Needs tests |
| Evaluasi Service | High | ⭕ Needs tests |
| Users Service | Medium | ⭕ Needs tests |
| TTE Service | Medium | ⭕ Needs tests |
| Controllers | Medium | ⭕ Needs tests |
| Guards/Filters | Low | ⭕ Needs tests |

---

## 11. Future Testing Improvements

### Planned Additions
1. **E2E Testing**: Implement Playwright for full browser automation
2. **Visual Regression**: Add screenshot testing for UI components
3. **Performance Testing**: Add load testing for API endpoints
4. **Accessibility Testing**: Add axe-core for a11y testing
5. **Contract Testing**: Add OpenAPI validation for API contracts
6. **Mutation Testing**: Add Stryker for mutation testing

### Coverage Goals
- **Frontend**: Increase to 80% coverage
- **Backend**: Increase to 70% coverage
- **Critical paths**: 100% coverage (auth, SOP workflow, TTE)
