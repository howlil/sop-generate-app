import { toWibDateOnly } from './wib-date.util';

describe('toWibDateOnly', () => {
  it('should_normalize_wib_instant_to_midnight_same_calendar_day', () => {
    const input = new Date('2026-05-19T23:30:00+07:00');
    const actual = toWibDateOnly(input);
    expect(actual.toISOString()).toBe('2026-05-18T17:00:00.000Z');
    expect(actual.getTime()).toBe(new Date('2026-05-19T00:00:00+07:00').getTime());
  });

  it('should_use_jakarta_calendar_day_when_utc_is_previous_day', () => {
    const input = new Date('2026-05-19T20:00:00.000Z');
    const actual = toWibDateOnly(input);
    expect(actual.getTime()).toBe(new Date('2026-05-20T00:00:00+07:00').getTime());
  });
});
