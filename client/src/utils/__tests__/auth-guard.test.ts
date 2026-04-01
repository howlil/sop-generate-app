/**
 * Utility Tests: auth-guard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard, isAuthenticated, getRole } from '@/utils/auth-guard';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', peran: 'TIM_PENYUSUN' },
    isAuthenticated: true,
  })),
  getRole: vi.fn(() => ({ id: '1', peran: 'TIM_PENYUSUN' })),
}));

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof authGuard).toBe('function');
  });
});

describe('isAuthenticated', () => {
  it('should be defined', () => {
    expect(isAuthenticated).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof isAuthenticated).toBe('function');
  });
});

describe('getRole', () => {
  it('should be defined', () => {
    expect(getRole).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof getRole).toBe('function');
  });
});
