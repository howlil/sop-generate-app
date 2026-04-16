export const ErrorCodes = {
  // Singleton constraint violations
  SINGLETON_CONSTRAINT_VIOLATION: 'SINGLETON_CONSTRAINT_VIOLATION',

  // User-related
  USER_EMAIL_EXISTS: 'USER_EMAIL_EXISTS',
  USER_NIP_EXISTS: 'USER_NIP_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Tim-related
  TIM_ALREADY_EXISTS: 'TIM_ALREADY_EXISTS',
  TIM_NOT_FOUND: 'TIM_NOT_FOUND',

  // Generic
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface StructuredError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
