/**
 * Utility Tests: delay
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay } from '@/utils/delay';

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const promise = delay(100);
    
    vi.advanceTimersByTime(100);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('should not resolve before specified time', async () => {
    const promise = delay(100);
    
    vi.advanceTimersByTime(50);
    
    let resolved = false;
    promise.then(() => { resolved = true; });
    
    expect(resolved).toBe(false);
  });

  it('should work with 0 delay', async () => {
    const promise = delay(0);
    
    vi.advanceTimersByTime(0);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('should work with large delay', async () => {
    const promise = delay(10000);
    
    vi.advanceTimersByTime(10000);
    
    await expect(promise).resolves.toBeUndefined();
  });
});
