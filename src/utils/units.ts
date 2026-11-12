import type { UnitSystem } from '../types/weather';

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function kmhToMph(kmh: number): number {
  return kmh / 1.609344;
}

export function mmToInches(mm: number): number {
  return mm / 25.4;
}

/** Rounds and normalises -0 so we never render "-0°". */
function roundDisplay(value: number): number {
  const rounded = Math.round(value);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function convertTemperature(celsius: number, units: UnitSystem): number {
  return roundDisplay(units === 'imperial' ? celsiusToFahrenheit(celsius) : celsius);
}

export function formatTemperature(celsius: number, units: UnitSystem): string {
  return `${convertTemperature(celsius, units)}°`;
}

export function formatWindSpeed(kmh: number, units: UnitSystem): string {
  return units === 'imperial' ? `${roundDisplay(kmhToMph(kmh))} mph` : `${roundDisplay(kmh)} km/h`;
}

export function formatPrecipitation(mm: number, units: UnitSystem): string {
  if (units === 'imperial') return `${mmToInches(mm).toFixed(2)} in`;
  return `${mm.toFixed(mm > 0 && mm < 10 ? 1 : 0)} mm`;
}

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function toCompassPoint(degrees: number): string {
  const normalised = ((degrees % 360) + 360) % 360;
  return COMPASS_POINTS[Math.round(normalised / 45) % COMPASS_POINTS.length] ?? 'N';
}

export function unitSymbol(units: UnitSystem): '°C' | '°F' {
  return units === 'imperial' ? '°F' : '°C';
}
