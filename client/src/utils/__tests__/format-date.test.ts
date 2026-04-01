/**
 * Utility Tests: formatDate
 */

import { describe, it, expect } from 'vitest';
import { formatDateIdLong, formatDateId } from '@/utils/format-date';

describe('formatDateIdLong', () => {
  it('should format date in Indonesian long format', () => {
    const result = formatDateIdLong('2026-04-01T00:00:00Z');
    expect(result).toContain('2026');
    // Format is "1 Apr 2026" (short month)
    expect(result).toMatch(/\d+ \w+ 2026/);
  });

  it('should format different months correctly', () => {
    expect(formatDateIdLong('2026-01-15T00:00:00Z')).toContain('Jan');
    expect(formatDateIdLong('2026-08-15T00:00:00Z')).toContain('Agu');
    expect(formatDateIdLong('2026-12-25T00:00:00Z')).toContain('Des');
  });

  it('should handle different years', () => {
    expect(formatDateIdLong('2020-01-01T00:00:00Z')).toContain('2020');
    expect(formatDateIdLong('2025-06-15T00:00:00Z')).toContain('2025');
  });
});

describe('formatDateId', () => {
  it('should format date in Indonesian short format', () => {
    const result = formatDateId('2026-04-01T00:00:00Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should format with day/month/year', () => {
    const result = formatDateId('2026-01-05T00:00:00Z');
    expect(result).toMatch(/\d+\/\d+\/2026/);
  });
});
