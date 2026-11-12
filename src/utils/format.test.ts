import { describe, expect, it } from 'vitest';
import { formatDayLabel, formatHour, wallClockToDate } from './format';

describe('location-local time formatting', () => {
  it('keeps wall-clock digits regardless of the viewer timezone', () => {
    const date = wallClockToDate('2026-11-12T14:00');
    expect(date.getUTCHours()).toBe(14);
    expect(date.getUTCDate()).toBe(12);
  });

  it('formats hours from the location wall clock', () => {
    expect(formatHour('2026-11-12T14:00', 'en-AU')).toMatch(/^2\s?pm$/i);
  });

  it('labels the first forecast day as Today', () => {
    expect(formatDayLabel('2026-11-12', 0, 'en-AU')).toBe('Today');
    expect(formatDayLabel('2026-11-13', 1, 'en-AU')).toBe('Fri');
  });
});
