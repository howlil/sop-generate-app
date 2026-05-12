import {
  buildTteQrPayload,
  buildTteQrVerificationUrl,
  normalizePublicVerifyBaseUrl,
} from './tte-verifikasi-qr.util';

describe('tte-verifikasi-qr.util', () => {
  describe('normalizePublicVerifyBaseUrl', () => {
    it('should return null for empty input', () => {
      expect(normalizePublicVerifyBaseUrl(undefined)).toBeNull();
      expect(normalizePublicVerifyBaseUrl('')).toBeNull();
      expect(normalizePublicVerifyBaseUrl('   ')).toBeNull();
    });

    it('should trim trailing slashes', () => {
      expect(normalizePublicVerifyBaseUrl('https://app.example.com/')).toBe('https://app.example.com');
      expect(normalizePublicVerifyBaseUrl('https://app.example.com///')).toBe('https://app.example.com');
    });
  });

  describe('buildTteQrVerificationUrl', () => {
    it('should append path and hash query', () => {
      const actualUrl = buildTteQrVerificationUrl({
        baseUrl: 'https://app.example.com',
        dokumenTteId: 'doc-uuid',
        hashDokumen: 'abc/def',
      });
      expect(actualUrl).toContain('/tte/verifikasi-dokumen/doc-uuid');
      expect(actualUrl).toContain('h=');
      expect(actualUrl).toContain(encodeURIComponent('abc/def'));
    });
  });

  describe('buildTteQrPayload', () => {
    it('should use URL as payload when base URL is set', () => {
      const actual = buildTteQrPayload({
        publicVerifyBaseUrl: 'https://portal.example',
        dokumenTteId: 'id-1',
        hashDokumen: 'hash-1',
      });
      expect(actual.qrVerificationUrl).not.toBeNull();
      expect(actual.qrPayload).toBe(actual.qrVerificationUrl);
    });

    it('should use JSON payload when base URL is unset', () => {
      const actual = buildTteQrPayload({
        publicVerifyBaseUrl: undefined,
        dokumenTteId: 'id-2',
        hashDokumen: 'hash-2',
      });
      expect(actual.qrVerificationUrl).toBeNull();
      expect(JSON.parse(actual.qrPayload)).toEqual({
        t: 'tte-verify-v1',
        dokumenTteId: 'id-2',
        hashDokumen: 'hash-2',
      });
    });
  });
});
