import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, formatWindSpeed, toCompassPoint } from './units';

describe('units', () => {
  it('converts and rounds temperatures', () => {
    expect(convertTemperature(0, 'imperial')).toBe(32);
    expect(convertTemperature(22.4, 'metric')).toBe(22);
    expect(convertTemperature(100, 'imperial')).toBe(212);
  });

  it('never renders negative zero', () => {
    expect(formatTemperature(-0.3, 'metric')).toBe('0°');
  });

  it('formats wind in the matching system', () => {
    expect(formatWindSpeed(16.09344, 'imperial')).toBe('10 mph');
    expect(formatWindSpeed(15.4, 'metric')).toBe('15 km/h');
  });

  it('maps degrees to compass points', () => {
    expect(toCompassPoint(0)).toBe('N');
    expect(toCompassPoint(142)).toBe('SE');
    expect(toCompassPoint(350)).toBe('N');
    expect(toCompassPoint(-90)).toBe('W');
  });
});
