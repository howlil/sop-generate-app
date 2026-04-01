/**
 * Utility Tests: constants
 */

import { describe, it, expect } from 'vitest';
import { ROLES, ROLE_LABELS, ROUTES } from '@/utils/constants';

describe('ROLES', () => {
  it('should have BIRO_ORGANISASI role', () => {
    expect(ROLES).toHaveProperty('BIRO_ORGANISASI');
  });

  it('should have TIM_PENYUSUN role', () => {
    expect(ROLES).toHaveProperty('TIM_PENYUSUN');
  });

  it('should have TIM_EVALUASI role', () => {
    expect(ROLES).toHaveProperty('TIM_EVALUASI');
  });

  it('should have KEPALA_OPD role', () => {
    expect(ROLES).toHaveProperty('KEPALA_OPD');
  });
});

describe('ROLE_LABELS', () => {
  it('should be defined', () => {
    expect(ROLE_LABELS).toBeDefined();
  });
});

describe('ROUTES', () => {
  it('should be defined', () => {
    expect(ROUTES).toBeDefined();
  });
});
