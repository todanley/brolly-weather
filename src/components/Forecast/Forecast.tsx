import { Droplet } from 'lucide-react';
import { describeWeather } from '../../api/weatherCodes';
import shared from '../../styles/shared.module.css';
import type { DailyForecast, UnitSystem } from '../../types/weather';
import { formatDayLabel, formatLongDate } from '../../utils/format';
import { formatTemperature } from '../../utils/units';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import styles from './Forecast.module.css';

interface ForecastProps {
  days: DailyForecast[];
  units: UnitSystem;
}

const PRECIPITATION_DISPLAY_THRESHOLD = 20;

export function Forecast({ days, units }: ForecastProps) {
  if (days.length === 0) return null;

  const weekMin = Math.min(...days.map((day) => day.minC));
  const weekMax = Math.max(...days.map((day) => day.maxC));
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <section className={`${shared.card} ${styles.root}`} aria-labelledby="forecast-heading">
      <h2 id="forecast-heading" className={shared.sectionTitle}>
        {days.length}-day forecast
      </h2>
      <ol className={styles.list}>
        {days.map((day, index) => {
          const condition = describeWeather(day.weatherCode);
          const offset = ((day.minC - weekMin) / span) * 100;
          const width = Math.max(((day.maxC - day.minC) / span) * 100, 4);
          const showPrecipitation = (day.precipitationProbabilityPct ?? 0) >= PRECIPITATION_DISPLAY_THRESHOLD;

          return (
            <li key={day.date} className={styles.day}>
              <span className={styles.dayName}>
                <span aria-hidden="true">{formatDayLabel(day.date, index)}</span>
                <span className="visually-hidden">{index === 0 ? 'Today' : formatLongDate(day.date)}</span>
              </span>
              <span className={styles.condition}>
                <WeatherIcon code={day.weatherCode} size={22} />
                <span className={styles.conditionText}>
                  <span className={styles.label}>{condition.label}</span>
                  {showPrecipitation && (
                    <span className={styles.precipitation}>
                      <Droplet size={10} aria-hidden="true" />
                      {day.precipitationProbabilityPct}%<span className="visually-hidden"> chance of precipitation</span>
                    </span>
                  )}
                </span>
              </span>
              <span className={styles.temps}>
                <span className={styles.low}>
                  <span className="visually-hidden">Low </span>
                  {formatTemperature(day.minC, units)}
                </span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.bar} style={{ left: `${offset}%`, width: `${width}%` }} />
                </span>
                <span className={styles.high}>
                  <span className="visually-hidden">High </span>
                  {formatTemperature(day.maxC, units)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
