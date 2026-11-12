import { Droplets, Navigation2, Thermometer, Umbrella, Wind, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { describeWeather } from '../../api/weatherCodes';
import shared from '../../styles/shared.module.css';
import type { DailyForecast, Place, UnitSystem, WeatherReport } from '../../types/weather';
import { formatLongDate, formatPlaceSubtitle, formatTime } from '../../utils/format';
import {
  convertTemperature,
  formatPrecipitation,
  formatTemperature,
  formatWindSpeed,
  toCompassPoint,
  unitSymbol,
} from '../../utils/units';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import styles from './CurrentWeather.module.css';

interface CurrentWeatherProps {
  place: Place;
  report: WeatherReport;
  today?: DailyForecast;
  units: UnitSystem;
}

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: ReactNode;
}

function Metric({ icon: Icon, label, value, hint }: MetricProps) {
  return (
    <div className={styles.metric}>
      <dt className={styles.metricLabel}>
        <Icon size={14} aria-hidden="true" />
        {label}
      </dt>
      <dd className={styles.metricValue}>
        {value}
        {hint && <span className={styles.metricHint}>{hint}</span>}
      </dd>
    </div>
  );
}

export function CurrentWeather({ place, report, today, units }: CurrentWeatherProps) {
  const { current, timezoneAbbreviation } = report;
  const condition = describeWeather(current.weatherCode);
  const subtitle = formatPlaceSubtitle(place);

  return (
    <section className={`${shared.card} ${styles.root}`} aria-labelledby="current-weather-heading">
      <header className={styles.header}>
        <h1 id="current-weather-heading" className={styles.place}>
          {place.name}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <p className={styles.timestamp}>
          {formatLongDate(current.time)} · {formatTime(current.time)} local time
          {timezoneAbbreviation && ` (${timezoneAbbreviation})`}
        </p>
      </header>

      <div className={styles.hero}>
        <div>
          <p className={styles.temperature}>
            {convertTemperature(current.temperatureC, units)}
            <span className={styles.unit}>{unitSymbol(units)}</span>
          </p>
          <p className={styles.condition}>{condition.label}</p>
          {today && (
            <p className={styles.range}>
              <span>H {formatTemperature(today.maxC, units)}</span>
              <span>L {formatTemperature(today.minC, units)}</span>
            </p>
          )}
        </div>
        <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={96} />
      </div>

      <dl className={styles.metrics}>
        <Metric icon={Thermometer} label="Feels like" value={formatTemperature(current.feelsLikeC, units)} />
        <Metric icon={Droplets} label="Humidity" value={`${Math.round(current.humidityPct)}%`} />
        <Metric
          icon={Wind}
          label="Wind"
          value={formatWindSpeed(current.windSpeedKmh, units)}
          hint={
            <>
              <Navigation2
                size={12}
                aria-hidden="true"
                style={{ transform: `rotate(${current.windDirectionDeg + 180}deg)` }}
              />
              {toCompassPoint(current.windDirectionDeg)}
            </>
          }
        />
        <Metric
          icon={Umbrella}
          label="Precipitation"
          value={formatPrecipitation(current.precipitationMm, units)}
          hint={today?.precipitationProbabilityPct != null ? `${today.precipitationProbabilityPct}% today` : undefined}
        />
      </dl>
    </section>
  );
}
