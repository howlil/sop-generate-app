/**
 * Auth Feature Module
 * Authentication, authorization, and user management
 */

// Types (no dependencies)
export type { LoginRequest, LoginResponse, RegisterRequest } from './types/auth'
export type { User, CreateUserRequest, UpdateUserRequest } from './types/users'
export { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from './types/auth'

// Services (only depend on types)
export { authApi } from './services/auth.api'
export { usersApi } from './services/users.api'

// Hooks (depend on services and types)
export { useAuth } from './hooks/useAuth'
export { useAppRole } from './hooks/useAppRole'
export { useUsers } from './hooks/useUsers'

// Components (depend on everything)
export { LoginForm } from './components/LoginForm'
export { LoginHero } from './components/LoginHero'
