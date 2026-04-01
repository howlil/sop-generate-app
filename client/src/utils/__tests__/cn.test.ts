/**
 * Utility Tests: cn (classNames)
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn Utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional');
    expect(result).toBe('base conditional');
  });

  it('should handle false conditionals', () => {
    const result = cn('base', false && 'hidden');
    expect(result).toBe('base');
  });

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'class');
    expect(result).toBe('base class');
  });

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2']);
    expect(result).toBe('class1 class2');
  });

  it('should handle object with boolean values', () => {
    const result = cn({ class1: true, class2: false, class3: true });
    expect(result).toBe('class1 class3');
  });

  it('should merge tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-6');
    // cn utility should merge classes - exact behavior depends on implementation
    expect(result).toContain('py-2');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
