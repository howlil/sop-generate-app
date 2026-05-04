import {
  buildAccessTokenCookieOptions,
  buildClearAccessTokenCookieOptions,
  resolveAccessTokenExpiry,
} from './auth.shared';

describe('resolveAccessTokenExpiry', () => {
  it('should_use_default_when_undefined', () => {
    const actual = resolveAccessTokenExpiry(undefined);
    expect(actual.expiresInSeconds).toBe(900);
    expect(actual.maxAgeMs).toBe(900_000);
  });

  it('should_use_default_when_empty_or_whitespace', () => {
    expect(resolveAccessTokenExpiry('').expiresInSeconds).toBe(900);
    expect(resolveAccessTokenExpiry('   ').expiresInSeconds).toBe(900);
  });

  it('should_use_default_when_ms_cannot_parse', () => {
    expect(resolveAccessTokenExpiry('bukan-timespan').expiresInSeconds).toBe(900);
  });

  it('should_parse_valid_string_timespan', () => {
    const actual = resolveAccessTokenExpiry('1h');
    expect(actual.expiresInSeconds).toBe(3600);
    expect(actual.maxAgeMs).toBe(3600_000);
  });

  it('should_treat_positive_integer_as_seconds', () => {
    const actual = resolveAccessTokenExpiry(120);
    expect(actual.expiresInSeconds).toBe(120);
    expect(actual.maxAgeMs).toBe(120_000);
  });
});

describe('buildClearAccessTokenCookieOptions', () => {
  it('should_match_set_cookie_options_except_maxAge', () => {
    const isProduction = false;
    const clearOpts = buildClearAccessTokenCookieOptions(isProduction);
    const setOpts = buildAccessTokenCookieOptions(60_000, isProduction);
    expect(clearOpts.path).toBe(setOpts.path);
    expect(clearOpts.httpOnly).toBe(setOpts.httpOnly);
    expect(clearOpts.sameSite).toBe(setOpts.sameSite);
    expect(clearOpts.secure).toBe(setOpts.secure);
  });
});
