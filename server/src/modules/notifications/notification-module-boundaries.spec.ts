import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const FORBIDDEN_NOTIFICATION_TERMS = [
  new RegExp(['what', 'sapp'].join(''), 'i'),
  new RegExp(['wa', 'gateway'].join(' '), 'i'),
  new RegExp(['evolution', 'api'].join(' '), 'i'),
] as const;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

describe('Notification module boundaries', () => {
  it('tidak memakai istilah kanal yang sudah dihapus di modul notifikasi', () => {
    const moduleRoot = __dirname;
    const files = listFiles(moduleRoot).filter(
      (file) => !file.endsWith('notification-module-boundaries.spec.ts'),
    );
    const violations = files.flatMap((file) => {
      const rel = relative(moduleRoot, file);
      const fileText = readFileSync(file, 'utf8');
      return FORBIDDEN_NOTIFICATION_TERMS.flatMap((term) => {
        const pathViolation = term.test(rel) ? [`path:${rel}`] : [];
        const contentViolation = term.test(fileText) ? [`content:${rel}`] : [];
        return [...pathViolation, ...contentViolation];
      });
    });

    expect(violations).toEqual([]);
  });
});
