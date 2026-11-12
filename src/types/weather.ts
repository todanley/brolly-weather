/**
 * Domain models used by the UI. These are deliberately decoupled from the
 * Open-Meteo response shape (see api/openMeteoTypes.ts) so the provider can be
 * swapped without touching components.
 *
 * All raw measurements are stored in metric units; conversion happens at
 * render time (utils/units.ts).
 *
 * Time strings are location-local wall-clock ISO strings without an offset,
 * e.g. "2026-11-12T14:00", exactly as returned with `timezone=auto`.
 */

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  isCurrentLocation?: boolean;
}

export interface CurrentConditions {
  time: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyPoint {
  time: string;
  temperatureC: number;
  weatherCode: number;
  precipitationProbabilityPct: number | null;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  maxC: number;
  minC: number;
  precipitationProbabilityPct: number | null;
  sunrise: string;
  sunset: string;
}

export interface WeatherReport {
  timezone: string;
  timezoneAbbreviation: string;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyForecast[];
}

export type UnitSystem = 'metric' | 'imperial';
