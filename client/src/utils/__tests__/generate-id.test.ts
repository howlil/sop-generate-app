/**
 * Utility Tests: generateId
 */

import { describe, it, expect } from 'vitest';
import { generateId } from '@/utils/generate-id';

describe('generateId', () => {
  it('should generate a string id', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate ids with default length', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate ids with custom length', () => {
    const id = generateId(10);
    expect(id.length).toBeGreaterThanOrEqual(10);
  });

  it('should generate ids with longer length', () => {
    const id = generateId(20);
    expect(id.length).toBeGreaterThanOrEqual(20);
  });

  it('should generate lowercase ids', () => {
    const id = generateId();
    expect(id).toBe(id.toLowerCase());
  });
});
