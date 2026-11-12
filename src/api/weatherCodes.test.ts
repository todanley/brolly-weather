import { describe, expect, it } from 'vitest';
import { describeWeather } from './weatherCodes';

describe('describeWeather', () => {
  it.each([
    [0, 'clear'],
    [2, 'partly-cloudy'],
    [3, 'cloudy'],
    [45, 'fog'],
    [53, 'drizzle'],
    [65, 'rain'],
    [67, 'freezing'],
    [75, 'snow'],
    [81, 'showers'],
    [99, 'thunderstorm'],
  ])('maps WMO code %i to %s', (code, group) => {
    expect(describeWeather(code).group).toBe(group);
  });

  it('falls back safely for unknown codes', () => {
    expect(describeWeather(42)).toEqual({ code: 42, label: 'Unknown conditions', group: 'unknown' });
  });
});
