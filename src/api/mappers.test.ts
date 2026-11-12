import { describe, expect, it } from 'vitest';
import { AppError } from './errors';
import { mapForecastResponse, mapGeocodingResponse } from './mappers';

const forecastFixture = {
  timezone: 'Australia/Sydney',
  timezone_abbreviation: 'GMT+11',
  current: {
    time: '2026-11-12T14:30',
    temperature_2m: 22.4,
    apparent_temperature: 23.5,
    relative_humidity_2m: 61,
    is_day: 1,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 15.4,
    wind_direction_10m: 142,
  },
  hourly: {
    time: ['2026-11-12T14:00', '2026-11-12T15:00'],
    temperature_2m: [22.6, 22.2],
    weather_code: [0, 1],
    precipitation_probability: [0, null],
    is_day: [1, 1],
  },
  daily: {
    time: ['2026-11-12'],
    weather_code: [3],
    temperature_2m_max: [24.1],
    temperature_2m_min: [16.2],
    precipitation_probability_max: [10],
    sunrise: ['2026-11-12T05:45'],
    sunset: ['2026-11-12T19:35'],
  },
};

describe('mapGeocodingResponse', () => {
  it('returns an empty list when Open-Meteo omits `results`', () => {
    expect(mapGeocodingResponse({ generationtime_ms: 0.04 })).toEqual([]);
  });

  it('maps results to places', () => {
    const [place] = mapGeocodingResponse({
      results: [
        {
          id: 2147714,
          name: 'Sydney',
          latitude: -33.86785,
          longitude: 151.20732,
          country: 'Australia',
          country_code: 'AU',
          admin1: 'New South Wales',
        },
      ],
    });
    expect(place).toMatchObject({ id: '2147714', name: 'Sydney', countryCode: 'AU', admin1: 'New South Wales' });
  });

  it('rejects malformed payloads with a typed error', () => {
    expect(() => mapGeocodingResponse({ results: [{ name: 'Nowhere' }] })).toThrowError(AppError);
  });
});

describe('mapForecastResponse', () => {
  it('converts column-oriented arrays into rows', () => {
    const report = mapForecastResponse(forecastFixture);
    expect(report.current).toMatchObject({ temperatureC: 22.4, isDay: true, weatherCode: 0 });
    expect(report.hourly).toHaveLength(2);
    expect(report.hourly[1]).toMatchObject({ time: '2026-11-12T15:00', precipitationProbabilityPct: null });
    expect(report.daily[0]).toMatchObject({ date: '2026-11-12', maxC: 24.1, minC: 16.2 });
  });

  it('flags mismatched column lengths as an invalid response', () => {
    const broken = { ...forecastFixture, hourly: { ...forecastFixture.hourly, temperature_2m: [22.6] } };
    try {
      mapForecastResponse(broken);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).kind).toBe('invalid-response');
    }
  });
});
