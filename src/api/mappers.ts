import type { CurrentConditions, DailyForecast, HourlyPoint, Place, WeatherReport } from '../types/weather';
import { AppError } from './errors';
import {
  asArrayOf,
  asNullableNumber,
  asNumber,
  asOptionalString,
  asRecord,
  asString,
} from './validate';

function readPlace(value: unknown, path: string): Place {
  const raw = asRecord(value, path);
  return {
    id: String(asNumber(raw.id, `${path}.id`)),
    name: asString(raw.name, `${path}.name`),
    latitude: asNumber(raw.latitude, `${path}.latitude`),
    longitude: asNumber(raw.longitude, `${path}.longitude`),
    admin1: asOptionalString(raw.admin1),
    country: asOptionalString(raw.country),
    countryCode: asOptionalString(raw.country_code),
    timezone: asOptionalString(raw.timezone),
  };
}

/** Open-Meteo omits `results` entirely when nothing matches. */
export function mapGeocodingResponse(body: unknown): Place[] {
  const raw = asRecord(body, 'geocoding');
  if (raw.results === undefined) return [];
  return asArrayOf(raw.results, 'geocoding.results', readPlace);
}

function readCurrent(value: unknown): CurrentConditions {
  const raw = asRecord(value, 'current');
  return {
    time: asString(raw.time, 'current.time'),
    temperatureC: asNumber(raw.temperature_2m, 'current.temperature_2m'),
    feelsLikeC: asNumber(raw.apparent_temperature, 'current.apparent_temperature'),
    humidityPct: asNumber(raw.relative_humidity_2m, 'current.relative_humidity_2m'),
    windSpeedKmh: asNumber(raw.wind_speed_10m, 'current.wind_speed_10m'),
    windDirectionDeg: asNumber(raw.wind_direction_10m, 'current.wind_direction_10m'),
    precipitationMm: asNumber(raw.precipitation, 'current.precipitation'),
    weatherCode: asNumber(raw.weather_code, 'current.weather_code'),
    isDay: asNumber(raw.is_day, 'current.is_day') === 1,
  };
}

/** Column-oriented arrays → row objects, verifying every column has the same length. */
function zipColumns<T>(
  section: string,
  columns: Record<string, unknown[]>,
  build: (index: number) => T,
): T[] {
  const lengths = Object.values(columns).map((column) => column.length);
  const length = lengths[0] ?? 0;
  if (lengths.some((other) => other !== length)) {
    throw new AppError('invalid-response', `Mismatched column lengths in "${section}"`);
  }
  return Array.from({ length }, (_, index) => build(index));
}

function readHourly(value: unknown): HourlyPoint[] {
  const raw = asRecord(value, 'hourly');
  const time = asArrayOf(raw.time, 'hourly.time', asString);
  const temperature = asArrayOf(raw.temperature_2m, 'hourly.temperature_2m', asNumber);
  const code = asArrayOf(raw.weather_code, 'hourly.weather_code', asNumber);
  const precipitation = asArrayOf(raw.precipitation_probability, 'hourly.precipitation_probability', asNullableNumber);
  const isDay = asArrayOf(raw.is_day, 'hourly.is_day', asNumber);

  return zipColumns('hourly', { time, temperature, code, precipitation, isDay }, (i) => ({
    time: time[i]!,
    temperatureC: temperature[i]!,
    weatherCode: code[i]!,
    precipitationProbabilityPct: precipitation[i] ?? null,
    isDay: isDay[i] === 1,
  }));
}

function readDaily(value: unknown): DailyForecast[] {
  const raw = asRecord(value, 'daily');
  const date = asArrayOf(raw.time, 'daily.time', asString);
  const code = asArrayOf(raw.weather_code, 'daily.weather_code', asNumber);
  const max = asArrayOf(raw.temperature_2m_max, 'daily.temperature_2m_max', asNumber);
  const min = asArrayOf(raw.temperature_2m_min, 'daily.temperature_2m_min', asNumber);
  const precipitation = asArrayOf(
    raw.precipitation_probability_max,
    'daily.precipitation_probability_max',
    asNullableNumber,
  );
  const sunrise = asArrayOf(raw.sunrise, 'daily.sunrise', asString);
  const sunset = asArrayOf(raw.sunset, 'daily.sunset', asString);

  return zipColumns('daily', { date, code, max, min, precipitation, sunrise, sunset }, (i) => ({
    date: date[i]!,
    weatherCode: code[i]!,
    maxC: max[i]!,
    minC: min[i]!,
    precipitationProbabilityPct: precipitation[i] ?? null,
    sunrise: sunrise[i]!,
    sunset: sunset[i]!,
  }));
}

export function mapForecastResponse(body: unknown): WeatherReport {
  const raw = asRecord(body, 'forecast');
  return {
    timezone: asString(raw.timezone, 'timezone'),
    timezoneAbbreviation: asOptionalString(raw.timezone_abbreviation) ?? '',
    current: readCurrent(raw.current),
    hourly: readHourly(raw.hourly),
    daily: readDaily(raw.daily),
  };
}
