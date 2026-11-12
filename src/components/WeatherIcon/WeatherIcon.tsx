import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Moon,
  Sun,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import { describeWeather, type ConditionGroup } from '../../api/weatherCodes';
import styles from './WeatherIcon.module.css';

const DAY_ICONS: Record<ConditionGroup, LucideIcon> = {
  clear: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudSunRain,
  freezing: CloudHail,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
  unknown: Thermometer,
};

const NIGHT_OVERRIDES: Partial<Record<ConditionGroup, LucideIcon>> = {
  clear: Moon,
  'partly-cloudy': CloudMoon,
  showers: CloudMoonRain,
};

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: number;
  /** Provide when the icon is the only thing conveying the condition. */
  label?: string;
}

export function WeatherIcon({ code, isDay = true, size = 24, label }: WeatherIconProps) {
  const { group } = describeWeather(code);
  const Icon = (!isDay && NIGHT_OVERRIDES[group]) || DAY_ICONS[group];
  return (
    <span className={styles.icon} data-group={group} data-day={isDay} role={label ? 'img' : undefined} aria-label={label}>
      <Icon size={size} strokeWidth={1.6} aria-hidden="true" />
    </span>
  );
}
