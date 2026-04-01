/**
 * Utility Tests: role-display
 */

import { describe, it, expect } from 'vitest';
import { getRoleDisplay, getRoleInitials } from '@/utils/role-display';

describe('getRoleDisplay', () => {
  it('should be defined', () => {
    expect(getRoleDisplay).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof getRoleDisplay).toBe('function');
  });
});

describe('getRoleInitials', () => {
  it('should be defined', () => {
    expect(getRoleInitials).toBeDefined();
  });

  it('should return a function', () => {
    expect(typeof getRoleInitials).toBe('function');
  });
});
