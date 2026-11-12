import type { Place, WeatherReport } from '../types/weather';
import { getJson } from './http';
import { mapForecastResponse, mapGeocodingResponse } from './mappers';
import { CURRENT_FIELDS, DAILY_FIELDS, HOURLY_FIELDS } from './openMeteoTypes';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export const FORECAST_DAYS = 7;
export const HOURLY_WINDOW = 24;
const MAX_SUGGESTIONS = 6;

interface CallOptions {
  signal?: AbortSignal;
}

export function searchPlaces(query: string, { signal }: CallOptions = {}): Promise<Place[]> {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: query,
    count: String(MAX_SUGGESTIONS),
    language: 'en',
    format: 'json',
  }).toString();
  return getJson(url, mapGeocodingResponse, { signal });
}

/**
 * Always requests metric units; unit conversion is a presentation concern so
 * toggling °C/°F never triggers a refetch.
 * `timezone=auto` makes every timestamp location-local.
 */
export function getWeatherReport(
  { latitude, longitude }: Pick<Place, 'latitude' | 'longitude'>,
  { signal }: CallOptions = {},
): Promise<WeatherReport> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    forecast_days: String(FORECAST_DAYS),
    forecast_hours: String(HOURLY_WINDOW),
    timezone: 'auto',
  }).toString();
  return getJson(url, mapForecastResponse, { signal });
}
