/**
 * Utility Function Tests - Date Formatting
 */

import { describe, it, expect } from 'vitest';

// Mock date formatting utility (should be extracted from utils)
function formatDateIdLong(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
}

function formatDateIdShort(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

function formatDateTimeId(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

describe('Utility Functions: Date Formatting', () => {
  describe('formatDateIdLong', () => {
    it('should format date in Indonesian long format', () => {
      const result = formatDateIdLong('2026-04-01T00:00:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('April');
      expect(result).toContain('1');
    });

    it('should format date with month name in Indonesian', () => {
      expect(formatDateIdLong('2026-01-15T00:00:00Z')).toContain('Januari');
      expect(formatDateIdLong('2026-08-15T00:00:00Z')).toContain('Agustus');
      expect(formatDateIdLong('2026-12-25T00:00:00Z')).toContain('Desember');
    });

    it('should handle different years correctly', () => {
      expect(formatDateIdLong('2020-01-01T00:00:00Z')).toContain('2020');
      expect(formatDateIdLong('2025-06-15T00:00:00Z')).toContain('2025');
      expect(formatDateIdLong('2030-12-31T00:00:00Z')).toContain('2030');
    });

    it('should handle different months correctly', () => {
      expect(formatDateIdLong('2026-02-01T00:00:00Z')).toContain('Februari');
      expect(formatDateIdLong('2026-03-01T00:00:00Z')).toContain('Maret');
      expect(formatDateIdLong('2026-05-01T00:00:00Z')).toContain('Mei');
      expect(formatDateIdLong('2026-10-01T00:00:00Z')).toContain('Oktober');
    });
  });

  describe('formatDateIdShort', () => {
    it('should format date in Indonesian short format', () => {
      const result = formatDateIdShort('2026-04-01T00:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format with 2-digit month and day', () => {
      const result = formatDateIdShort('2026-01-05T00:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/);
    });
  });

  describe('formatDateTimeId', () => {
    it('should format date with time in Indonesian', () => {
      const result = formatDateTimeId('2026-04-01T10:30:00Z');
      expect(result).toContain('2026');
      expect(result).toContain('April');
      expect(result).toContain('1');
      expect(result).toContain('pukul'); // Indonesian uses "pukul" for time separator
    });

    it('should include hours and minutes', () => {
      const result = formatDateTimeId('2026-04-01T14:45:00Z');
      expect(result).toMatch(/\d{2}\.\d{2}/); // Indonesian format uses dot separator (21.45)
    });
  });
});
