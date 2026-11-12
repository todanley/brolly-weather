import type { Place } from '../types/weather';

/**
 * Open-Meteo (with timezone=auto) returns location-local wall-clock strings
 * such as "2026-11-12T14:00" without an offset. Parsing them with `new Date()`
 * would silently reinterpret them in the *viewer's* timezone, so we treat them
 * as UTC and format with timeZone "UTC" — the digits shown are exactly the
 * location's local time, regardless of where the viewer is.
 */
export function wallClockToDate(isoLocal: string): Date {
  const [datePart = '', timePart = '00:00'] = isoLocal.split('T');
  const [year = 1970, month = 1, day = 1] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0] = timePart.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function format(isoLocal: string, options: Intl.DateTimeFormatOptions, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(wallClockToDate(isoLocal));
}

export function formatHour(isoLocal: string, locale?: string): string {
  return format(isoLocal, { hour: 'numeric' }, locale);
}

export function formatTime(isoLocal: string, locale?: string): string {
  return format(isoLocal, { hour: 'numeric', minute: '2-digit' }, locale);
}

export function formatWeekdayShort(isoDate: string, locale?: string): string {
  return format(isoDate, { weekday: 'short' }, locale);
}

export function formatLongDate(isoLocal: string, locale?: string): string {
  return format(isoLocal, { weekday: 'long', day: 'numeric', month: 'long' }, locale);
}

export function formatDayLabel(isoDate: string, index: number, locale?: string): string {
  return index === 0 ? 'Today' : formatWeekdayShort(isoDate, locale);
}

export function formatPlaceSubtitle(place: Place): string {
  if (place.isCurrentLocation) {
    return `${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°`;
  }
  const parts = [place.admin1, place.country].filter((part): part is string => Boolean(part));
  return [...new Set(parts)].join(', ');
}
