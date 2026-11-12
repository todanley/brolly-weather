/**
 * WMO weather interpretation codes as used by Open-Meteo.
 * https://open-meteo.com/en/docs (section "WMO Weather interpretation codes")
 */

export type ConditionGroup =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'showers'
  | 'freezing'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

export interface WeatherCondition {
  code: number;
  label: string;
  group: ConditionGroup;
}

const CONDITIONS: Readonly<Record<number, Omit<WeatherCondition, 'code'>>> = {
  0: { label: 'Clear sky', group: 'clear' },
  1: { label: 'Mostly clear', group: 'clear' },
  2: { label: 'Partly cloudy', group: 'partly-cloudy' },
  3: { label: 'Overcast', group: 'cloudy' },
  45: { label: 'Fog', group: 'fog' },
  48: { label: 'Freezing fog', group: 'fog' },
  51: { label: 'Light drizzle', group: 'drizzle' },
  53: { label: 'Drizzle', group: 'drizzle' },
  55: { label: 'Heavy drizzle', group: 'drizzle' },
  56: { label: 'Light freezing drizzle', group: 'freezing' },
  57: { label: 'Freezing drizzle', group: 'freezing' },
  61: { label: 'Light rain', group: 'rain' },
  63: { label: 'Rain', group: 'rain' },
  65: { label: 'Heavy rain', group: 'rain' },
  66: { label: 'Light freezing rain', group: 'freezing' },
  67: { label: 'Freezing rain', group: 'freezing' },
  71: { label: 'Light snow', group: 'snow' },
  73: { label: 'Snow', group: 'snow' },
  75: { label: 'Heavy snow', group: 'snow' },
  77: { label: 'Snow grains', group: 'snow' },
  80: { label: 'Light showers', group: 'showers' },
  81: { label: 'Showers', group: 'showers' },
  82: { label: 'Violent showers', group: 'showers' },
  85: { label: 'Light snow showers', group: 'snow' },
  86: { label: 'Heavy snow showers', group: 'snow' },
  95: { label: 'Thunderstorm', group: 'thunderstorm' },
  96: { label: 'Thunderstorm with hail', group: 'thunderstorm' },
  99: { label: 'Severe thunderstorm with hail', group: 'thunderstorm' },
};

export function describeWeather(code: number): WeatherCondition {
  const known = CONDITIONS[code];
  return known ? { code, ...known } : { code, label: 'Unknown conditions', group: 'unknown' };
}
