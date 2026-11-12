import { Droplet } from 'lucide-react';
import { describeWeather } from '../../api/weatherCodes';
import shared from '../../styles/shared.module.css';
import type { HourlyPoint, UnitSystem } from '../../types/weather';
import { formatHour } from '../../utils/format';
import { formatTemperature } from '../../utils/units';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import styles from './HourlyStrip.module.css';

interface HourlyStripProps {
  hours: HourlyPoint[];
  units: UnitSystem;
}

/** Below this, precipitation chance is noise and only adds clutter. */
const PRECIPITATION_DISPLAY_THRESHOLD = 20;

export function HourlyStrip({ hours, units }: HourlyStripProps) {
  if (hours.length === 0) return null;

  return (
    <section className={`${shared.card} ${styles.root}`} aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className={shared.sectionTitle}>
        Next {hours.length} hours
      </h2>
      <div className={styles.scroller} tabIndex={0} role="region" aria-label="Hourly forecast, scrollable">
        <ol className={styles.list}>
          {hours.map((hour, index) => {
            const condition = describeWeather(hour.weatherCode);
            const showPrecipitation = (hour.precipitationProbabilityPct ?? 0) >= PRECIPITATION_DISPLAY_THRESHOLD;
            return (
              <li key={hour.time} className={styles.hour} data-now={index === 0}>
                <span className={styles.time}>{index === 0 ? 'Now' : formatHour(hour.time)}</span>
                <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={26} label={condition.label} />
                <span className={styles.temperature}>{formatTemperature(hour.temperatureC, units)}</span>
                <span className={styles.precipitation} aria-hidden={!showPrecipitation}>
                  {showPrecipitation && (
                    <>
                      <Droplet size={10} aria-hidden="true" />
                      <span className="visually-hidden">Chance of precipitation </span>
                      {hour.precipitationProbabilityPct}%
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
