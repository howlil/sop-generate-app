/**
 * Auth Feature Module
 * Authentication, authorization, and user management
 */

// Types (no dependencies)
export type { LoginRequest, LoginResponse } from "./types/auth";
export type { User } from "./types/users";
// Type aliases for backward compatibility
// (Removed: CreateUserRequest, UpdateUserRequest were unused)

// Services (only depend on types)
export { authApi } from "./services/auth.api";
export { usersApi } from "./services/users.api";

// Hooks (depend on services and types)
export { useAuth } from "./hooks/useAuth";
export { useAppRole } from "./hooks/useAppRole";
export { useUsers } from "./hooks/useUsers";

export { LoginForm } from "./components/LoginForm";
export { LoginHero } from "./components/LoginHero";
