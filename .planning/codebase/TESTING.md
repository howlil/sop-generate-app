# Testing

## Server Testing

### Framework
- **Jest** with `ts-jest` transformer
- Config: `jest` block in `package.json` (standard NestJS CLI scaffold)
- Test regex: `.*\.spec\.ts$`
- Coverage output: not configured

### Test Files (current)
| File | Type | What it tests |
|---|---|---|
| `src/app.controller.spec.ts` | Unit | Root AppController |
| `src/modules/users/service/user.service.spec.ts` | Unit | UserService business logic |
| `src/modules/users/controller/user.controller.spec.ts` | Unit | UserController request handling |
| `test/app.e2e-spec.ts` | E2E | App bootstrap (NestJS e2e) |

### Unit Test Pattern
```ts
// 1. Define mock objects at top level
const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

// 2. Use Test.createTestingModule with useValue
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      { provide: UserRepository, useValue: mockUserRepository },
    ],
  }).compile();
  service = module.get<UserService>(UserService);
});

// 3. Mock async returns
mockUserRepository.findByEmail.mockResolvedValue(null);
mockUserRepository.create.mockResolvedValue(mockUser);

// 4. Assert errors
await expect(service.create(dto)).rejects.toThrow(ConflictException);
```

### Coverage
- Only Users module has tests (service + controller)
- Posts module and Health module have **no tests**
- No integration tests beyond app.e2e-spec.ts bootstrap

## Client Testing

### Framework
- **Vitest** + `@testing-library/react` installed
- Config: in `vite.config.ts` (vitest block)
- jsdom environment expected

### Test Files
**Zero client test files exist** — no `*.test.ts` or `*.spec.ts` in `client/src/`.

### What Should Be Tested (but isn't)
- Complex routing algorithms in `src/components/sop/diagram/logic/`:
  - `bpmnRouter.ts`
  - `orthogonalRouter.ts`
  - `flowchartPagination.ts`
- Zustand store logic (create/update/delete in each store)
- Domain pure functions in `src/lib/domain/` (TTE pin hash/verify, role, SOP status transitions)
- Route guard `requireRoleBeforeLoad`

## Running Tests

### Server
```bash
cd server
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

### Client
```bash
cd client
npm run test          # Vitest (no tests exist yet — will pass vacuously)
```

## Mocking Philosophy (Server)
- Dependencies injected via NestJS DI; mocked via `useValue` in test modules
- `jest.fn()` for all repository methods
- `mockResolvedValue` for async (not `mockReturnValue`)
- `mockRejectedValue` not used — errors tested via `rejects.toThrow`
- No database mocking; tests are pure unit tests, no Prisma in test runs
