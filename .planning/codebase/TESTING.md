# TESTING.md — Test Structure and Practices

## Overview

Testing is split across client and server with different frameworks. The server has active test files; the client has testing infrastructure configured but no test files written yet.

---

## Server Testing

### Framework
- **Jest** + **ts-jest** for TypeScript transformation
- **@nestjs/testing** for NestJS module testing utilities
- **supertest** for e2e HTTP testing

### Configuration
- `jest.json` — unit test config (co-located `*.spec.ts` files)
- `jest-e2e.json` — e2e test config (test files in `test/` directory)
- `tsconfig.json` with `strict: true` applies to tests

### Test File Location
- Unit tests: co-located with source (`src/**/*.spec.ts`)
- E2E tests: `test/` directory at server root

### Test Structure Pattern
```ts
// Unit test — NestJS service
import { Test, TestingModule } from "@nestjs/testing"
import { SopService } from "./sop.service"
import { PrismaService } from "../prisma/prisma.service"

describe("SopService", () => {
  let service: SopService
  let prisma: jest.Mocked<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopService,
        {
          provide: PrismaService,
          useValue: {
            sop: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<SopService>(SopService)
    prisma = module.get(PrismaService)
  })

  it("should return SOPs", async () => {
    prisma.sop.findMany.mockResolvedValue([...])
    const result = await service.findAll()
    expect(result).toHaveLength(...)
  })

  it("should throw NotFoundException when SOP not found", async () => {
    prisma.sop.findUnique.mockResolvedValue(null)
    await expect(service.findOne("id")).rejects.toThrow(NotFoundException)
  })
})
```

### Mocking Pattern
- Mock objects created inline with `useValue: { method: jest.fn() }`
- `mockResolvedValue()` for async Prisma operations
- `mockReturnValue()` for sync utilities
- `jest.spyOn()` for spying on real implementations
- `rejects.toThrow()` for exception testing

### E2E Pattern
```ts
// E2E test — HTTP endpoint
import * as request from "supertest"
import { Test } from "@nestjs/testing"
import { AppModule } from "../src/app.module"

describe("SOP (e2e)", () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = module.createNestApplication()
    await app.init()
  })

  it("GET /sop", () => {
    return request(app.getHttpServer())
      .get("/sop")
      .expect(200)
      .expect((res) => { expect(res.body.data).toBeDefined() })
  })

  afterAll(() => app.close())
})
```

### Running Tests
```bash
# Unit tests
cd server && pnpm test

# E2E tests
cd server && pnpm test:e2e

# Coverage
cd server && pnpm test:cov
```

---

## Client Testing

### Framework (Configured, Not Yet Used)
- **Vitest** — test runner (configured in `vite.config.ts` or `vitest.config.ts`)
- **@testing-library/react** — component testing
- **jsdom** — browser environment simulation

### Status
- Infrastructure configured: Vitest + Testing Library dependencies in `package.json`
- **No test files currently written** in `client/src/`
- `vitest run` command available in `package.json` scripts

### When Tests Are Added (Expected Pattern)
```tsx
// Component test
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BuatSOPDialog } from "./BuatSOPDialog"

describe("BuatSOPDialog", () => {
  it("renders dialog trigger", () => {
    render(<BuatSOPDialog />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })
})
```

```ts
// Hook test
import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useDaftarSOPData } from "./useDaftarSOPData"

describe("useDaftarSOPData", () => {
  it("returns filtered SOPs", () => {
    const { result } = renderHook(() => useDaftarSOPData())
    expect(result.current.data).toBeDefined()
  })
})
```

---

## Coverage

### Server
- Jest coverage via `pnpm test:cov`
- Output to `coverage/` directory
- No coverage thresholds currently enforced in config

### Client
- Vitest coverage not yet configured
- No coverage reports generated

---

## Gaps and Recommendations

1. **Client has zero tests** — all frontend logic is untested
2. **Domain functions** in `client/src/lib/domain/` are pure functions; easy to unit test with Vitest
3. **No coverage thresholds** enforced on either side
4. **Seed data used for testing** rather than proper fixtures/factories
5. **No integration tests** between client and server
