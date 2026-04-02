# Technology Stack

**Project**: Sistem Informasi SOP Biro Organisasi  
**Type**: Full-stack Web Application  
**Architecture**: Monorepo (Client + Server + Database)

---

## 1. Frontend Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.7.2 | Type safety |
| Vite | 7.1.7 | Build tool & dev server |

### Routing & State Management
| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-router | 1.132.0 | File-based routing with SSR support |
| @tanstack/react-query | 5.96.1 | Server state management & caching |
| zustand | 5.0.11 | Client state management (lightweight alternative to Redux) |

### UI & Styling
| Library | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.1.18 | Utility-first CSS framework |
| @radix-ui/react-* | Various | Headless UI components (accordion, dialog, dropdown, etc.) |
| lucide-react | 0.561.0 | Icon library |
| framer-motion | 12.36.0 | Animation library |
| class-variance-authority | 0.7.1 | Component variant management |
| clsx + tailwind-merge | 2.1.1 | Conditional className utilities |

### Development & Testing
| Tool | Version | Purpose |
|------|---------|---------|
| vitest | 3.0.5 | Unit & integration testing |
| @testing-library/react | 16.2.0 | React testing utilities |
| msw | 2.12.14 | API mocking for tests |
| @vitest/coverage-v8 | 3.2.4 | Code coverage |

---

## 2. Backend Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.0.1 | Node.js framework (Angular-style architecture) |
| TypeScript | 5.7.3 | Type safety |
| CommonJS | - | Module system |

### Database & ORM
| Library | Version | Purpose |
|---------|---------|---------|
| Prisma | 7.5.0 | Type-safe ORM |
| @prisma/client | 7.5.0 | Database client |
| @prisma/adapter-mariadb | 7.5.0 | MySQL/MariaDB adapter |
| mysql2 | 3.20.0 | MySQL driver |

### Authentication & Security
| Library | Version | Purpose |
|---------|---------|---------|
| @nestjs/jwt | 11.0.2 | JWT token generation & validation |
| @nestjs/passport | 11.0.5 | Passport integration |
| passport | 0.7.0 | Authentication middleware |
| passport-jwt | 4.0.1 | JWT strategy |
| bcrypt | 6.0.0 | Password hashing |

### Validation & Serialization
| Library | Version | Purpose |
|---------|---------|---------|
| class-validator | 0.15.1 | DTO validation decorators |
| class-transformer | 0.5.1 | Object transformation |
| zod | 3.24.0 | Schema validation (env validation) |

### Logging & Monitoring
| Library | Version | Purpose |
|---------|---------|---------|
| winston | 3.19.0 | Logging framework |
| nest-winston | 1.10.2 | Winston integration for NestJS |

### API Documentation
| Library | Version | Purpose |
|---------|---------|---------|
| @nestjs/swagger | 11.2.6 | OpenAPI/Swagger documentation |

### Rate Limiting
| Library | Version | Purpose |
|---------|---------|---------|
| @nestjs/throttler | 6.5.0 | Rate limiting (5 req/min for auth, 100 req/hour general) |

### Testing
| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 30.0.0 | Unit & integration testing |
| @nestjs/testing | 11.0.1 | NestJS testing utilities |
| supertest | 7.0.0 | HTTP assertion testing |
| @faker-js/faker | 10.4.0 | Test data generation |

---

## 3. Database

| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0 | Primary database |
| Docker | - | Containerization (mysql:8.0 image) |

### Database Characteristics
- **Engine**: InnoDB (supports transactions, foreign keys)
- **Timezone**: Asia/Jakarta
- **Connection Limit**: 10 connections per Prisma configuration

---

## 4. DevOps & Infrastructure

### Containerization
| Tool | Purpose |
|------|---------|
| Docker | Container runtime for all services |
| docker-compose | Multi-container orchestration |

### Services in Docker Compose
1. **db** (MySQL 8.0)
   - Port: 3306
   - Health check: mysqladmin ping
   - Volume: db_data (persistent storage)

2. **server** (NestJS)
   - Port: 8080 → 3000 (internal)
   - Hot reload enabled
   - Depends on: db (service_healthy)
   - Command: prisma generate → migrate deploy → start:dev

3. **client** (React + Vite)
   - Port: 3000
   - Hot reload enabled
   - Vite HMR polling for Docker
   - Depends on: server

### Environment Configuration
| Variable | Default | Purpose |
|----------|---------|---------|
| NODE_ENV | development | Runtime mode |
| DB_ROOT_PASSWORD | rootpassword | Database root password |
| JWT_SECRET | (custom) | JWT signing key |
| JWT_EXPIRATION | 15m | Access token lifetime |
| JWT_REFRESH_EXPIRATION | 7d | Refresh token lifetime |
| ALLOWED_ORIGINS | localhost:3000,5173 | CORS whitelist |

---

## 5. Build Tools

### Frontend Build
```json
{
  "build": "vite build",
  "dev": "vite dev --port 3000",
  "preview": "vite preview",
  "test": "vitest run"
}
```

### Backend Build
```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "lint": "eslint --fix",
  "test": "jest",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

---

## 6. Key Dependencies Summary

### Production Dependencies Count
- **Frontend**: 20 runtime dependencies
- **Backend**: 19 runtime dependencies

### Development Dependencies Count
- **Frontend**: 13 dev dependencies
- **Backend**: 21 dev dependencies

### Notable Version Choices
- **React 19**: Using latest major version (cutting-edge but may have ecosystem compatibility considerations)
- **Tailwind CSS 4**: Latest major version with new engine
- **NestJS 11**: Latest major version
- **Prisma 7**: Latest major version with MariaDB adapter
- **Vite 7**: Latest major version

---

## 7. Package Managers

| Project | Manager | Lock File |
|---------|---------|-----------|
| Client | pnpm | pnpm-lock.yaml |
| Server | pnpm | pnpm-lock.yaml |

---

## 8. Code Quality Tools

### Linting & Formatting
| Tool | Configuration |
|------|---------------|
| ESLint | eslint.config.mjs (flat config) |
| Prettier | .prettierrc |
| TypeScript ESLint | typescript-eslint with parser service |

### TypeScript Configuration
**Frontend (client/tsconfig.json)**:
- Strict mode enabled
- Module resolution: bundler
- No emit (Vite handles compilation)
- Path alias: `@/*` → `./src/*`

**Backend (server/tsconfig.json)**:
- Module: commonjs
- Target: ES2020
- Decorators enabled (experimentalDecorators, emitDecoratorMetadata)
- Out dir: ./dist
- Path alias: `@/*` → `./src/*` (via baseUrl)

---

## 9. Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/health` | Kubernetes/Docker health check |
| `/api/v1/*` | API versioning (v1 default) |
| `/docs` | Swagger UI |

---

## 10. Technology Decisions

### Why This Stack?
1. **TypeScript everywhere**: Type safety from database to UI
2. **NestJS**: Structured, Angular-inspired architecture for backend
3. **Prisma**: Type-safe database access with auto-generated types
4. **TanStack Router**: File-based routing with built-in code splitting
5. **Radix UI**: Accessible, unstyled components for custom design system
6. **Docker**: Consistent development and production environments

### Architecture Benefits
- **Monorepo structure**: Shared types, coordinated versioning
- **Containerized**: Easy deployment, consistent environments
- **Type-safe end-to-end**: Prisma + TypeScript catches errors at compile time
- **Modern tooling**: Vite for fast HMR, Jest/Vitest for testing
