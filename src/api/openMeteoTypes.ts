/**
 * Raw response shapes for the subset of Open-Meteo fields we request.
 * https://open-meteo.com/en/docs
 * https://open-meteo.com/en/docs/geocoding-api
 */

export interface GeocodingResultDto {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface GeocodingResponseDto {
  results?: GeocodingResultDto[];
}

export interface ForecastResponseDto {
  timezone: string;
  timezone_abbreviation: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
}

export const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'is_day',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
] as const;

export const HOURLY_FIELDS = ['temperature_2m', 'weather_code', 'precipitation_probability', 'is_day'] as const;

export const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
] as const;
