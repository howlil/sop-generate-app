/**
 * Utility Tests: role-route-guard
 */

import { describe, it, expect } from 'vitest';
import { roleGuard, checkRole } from '@/utils/role-route-guard';

describe('roleGuard', () => {
  it('should be defined', () => {
    expect(roleGuard).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof roleGuard).toBe('function');
  });
});

describe('checkRole', () => {
  it('should be defined', () => {
    expect(checkRole).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof checkRole).toBe('function');
  });
});
