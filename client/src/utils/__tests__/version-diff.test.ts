/**
 * Utility Function Tests - Version Diff
 * Tests for comparing SOP versions and detecting changes
 */

import { describe, it, expect } from 'vitest';

// Mock version diff utility (should be extracted from utils/version-diff)
interface VersionDiff {
  added: string[];
  removed: string[];
  modified: Array<{ field: string; oldValue: any; newValue: any }>;
  unchanged: string[];
}

function compareVersions(
  oldVersion: Record<string, any>,
  newVersion: Record<string, any>
): VersionDiff {
  const diff: VersionDiff = {
    added: [],
    removed: [],
    modified: [],
    unchanged: [],
  };

  const allKeys = new Set([...Object.keys(oldVersion), ...Object.keys(newVersion)]);

  allKeys.forEach((key) => {
    const oldValue = oldVersion[key];
    const newValue = newVersion[key];

    if (oldValue === undefined && newValue !== undefined) {
      diff.added.push(key);
    } else if (oldValue !== undefined && newValue === undefined) {
      diff.removed.push(key);
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff.modified.push({ field: key, oldValue, newValue });
    } else {
      diff.unchanged.push(key);
    }
  });

  return diff;
}

function hasChanges(diff: VersionDiff): boolean {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;
}

function getChangeSummary(diff: VersionDiff): string {
  const changes: string[] = [];
  if (diff.added.length > 0) changes.push(`${diff.added.length} added`);
  if (diff.removed.length > 0) changes.push(`${diff.removed.length} removed`);
  if (diff.modified.length > 0) changes.push(`${diff.modified.length} modified`);
  return changes.join(', ') || 'No changes';
}

describe('Utility Functions: Version Diff', () => {
  describe('compareVersions', () => {
    it('should detect added fields', () => {
      const oldVersion = { judul: 'SOP Test', status: 'DRAFT' };
      const newVersion = { judul: 'SOP Test', status: 'DRAFT', deskripsi: 'New description' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.added).toContain('deskripsi');
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });

    it('should detect removed fields', () => {
      const oldVersion = { judul: 'SOP Test', status: 'DRAFT', deskripsi: 'Description' };
      const newVersion = { judul: 'SOP Test', status: 'DRAFT' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.removed).toContain('deskripsi');
      expect(diff.modified).toHaveLength(0);
      expect(diff.added).toHaveLength(0);
    });

    it('should detect modified fields', () => {
      const oldVersion = { judul: 'SOP Test', status: 'DRAFT' };
      const newVersion = { judul: 'SOP Updated', status: 'SEDANG_DISUSUN' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.modified).toHaveLength(2);
      expect(diff.modified.find((m) => m.field === 'judul')?.oldValue).toBe('SOP Test');
      expect(diff.modified.find((m) => m.field === 'judul')?.newValue).toBe('SOP Updated');
      expect(diff.modified.find((m) => m.field === 'status')?.oldValue).toBe('DRAFT');
      expect(diff.modified.find((m) => m.field === 'status')?.newValue).toBe('SEDANG_DISUSUN');
    });

    it('should detect unchanged fields', () => {
      const oldVersion = { judul: 'SOP Test', status: 'DRAFT', opdId: 'opd-1' };
      const newVersion = { judul: 'SOP Test', status: 'DRAFT', opdId: 'opd-1' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.unchanged).toContain('judul');
      expect(diff.unchanged).toContain('status');
      expect(diff.unchanged).toContain('opdId');
      expect(diff.modified).toHaveLength(0);
    });

    it('should handle complex nested objects', () => {
      const oldVersion = {
        metadata: { institution: 'Org A', pic: 'Person A' },
        status: 'DRAFT',
      };
      const newVersion = {
        metadata: { institution: 'Org B', pic: 'Person A' },
        status: 'DRAFT',
      };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].field).toBe('metadata');
    });

    it('should handle empty objects', () => {
      const oldVersion = {};
      const newVersion = { judul: 'SOP Test' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.added).toContain('judul');
      expect(diff.modified).toHaveLength(0);
    });

    it('should handle null values', () => {
      const oldVersion = { deskripsi: null, status: 'DRAFT' };
      const newVersion = { deskripsi: 'Description', status: 'DRAFT' };

      const diff = compareVersions(oldVersion, newVersion);

      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].field).toBe('deskripsi');
    });
  });

  describe('hasChanges', () => {
    it('should return true when fields are added', () => {
      const diff: VersionDiff = { added: ['field1'], removed: [], modified: [], unchanged: [] };
      expect(hasChanges(diff)).toBe(true);
    });

    it('should return true when fields are removed', () => {
      const diff: VersionDiff = { added: [], removed: ['field1'], modified: [], unchanged: [] };
      expect(hasChanges(diff)).toBe(true);
    });

    it('should return true when fields are modified', () => {
      const diff: VersionDiff = { added: [], removed: [], modified: [{ field: 'field1', oldValue: 'a', newValue: 'b' }], unchanged: [] };
      expect(hasChanges(diff)).toBe(true);
    });

    it('should return false when no changes', () => {
      const diff: VersionDiff = { added: [], removed: [], modified: [], unchanged: ['field1'] };
      expect(hasChanges(diff)).toBe(false);
    });
  });

  describe('getChangeSummary', () => {
    it('should return summary with added count', () => {
      const diff: VersionDiff = { added: ['field1', 'field2'], removed: [], modified: [], unchanged: [] };
      expect(getChangeSummary(diff)).toBe('2 added');
    });

    it('should return summary with removed count', () => {
      const diff: VersionDiff = { added: [], removed: ['field1'], modified: [], unchanged: [] };
      expect(getChangeSummary(diff)).toBe('1 removed');
    });

    it('should return summary with modified count', () => {
      const diff: VersionDiff = { added: [], removed: [], modified: [{ field: 'field1', oldValue: 'a', newValue: 'b' }], unchanged: [] };
      expect(getChangeSummary(diff)).toBe('1 modified');
    });

    it('should return combined summary', () => {
      const diff: VersionDiff = {
        added: ['field1', 'field2'],
        removed: ['field3'],
        modified: [{ field: 'field4', oldValue: 'a', newValue: 'b' }],
        unchanged: [],
      };
      expect(getChangeSummary(diff)).toBe('2 added, 1 removed, 1 modified');
    });

    it('should return "No changes" for empty diff', () => {
      const diff: VersionDiff = { added: [], removed: [], modified: [], unchanged: ['field1'] };
      expect(getChangeSummary(diff)).toBe('No changes');
    });
  });
});
