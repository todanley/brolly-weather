import { describeWeather } from '../api/weatherCodes';

export type SkyTheme =
  | 'neutral'
  | 'clear-day'
  | 'clear-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

/** Maps current conditions to one of a few background palettes (styles/global.css). */
export function skyThemeFor(weatherCode: number, isDay: boolean): SkyTheme {
  switch (describeWeather(weatherCode).group) {
    case 'clear':
      return isDay ? 'clear-day' : 'clear-night';
    case 'partly-cloudy':
    case 'cloudy':
    case 'unknown':
      return isDay ? 'cloudy-day' : 'cloudy-night';
    case 'fog':
      return isDay ? 'fog' : 'cloudy-night';
    case 'drizzle':
    case 'rain':
    case 'showers':
    case 'freezing':
      return 'rain';
    case 'snow':
      return 'snow';
    case 'thunderstorm':
      return 'storm';
  }
}
