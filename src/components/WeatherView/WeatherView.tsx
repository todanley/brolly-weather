import type { AsyncState } from '../../types/async';
import type { Place, UnitSystem, WeatherReport } from '../../types/weather';
import { CurrentWeather } from '../CurrentWeather/CurrentWeather';
import { ErrorState } from '../ErrorState/ErrorState';
import { Forecast } from '../Forecast/Forecast';
import { HourlyStrip } from '../HourlyStrip/HourlyStrip';
import { WeatherSkeleton } from '../Skeleton/Skeleton';
import { Welcome } from '../Welcome/Welcome';
import styles from './WeatherView.module.css';

interface WeatherViewProps {
  place: Place | null;
  state: AsyncState<WeatherReport>;
  units: UnitSystem;
  onRetry: () => void;
  onSelectPlace: (place: Place) => void;
}

/** Maps the weather state machine to exactly one screen. Every state renders something. */
export function WeatherView({ place, state, units, onRetry, onSelectPlace }: WeatherViewProps) {
  if (!place || state.status === 'idle') return <Welcome onSelect={onSelectPlace} />;

  switch (state.status) {
    case 'loading':
      return <WeatherSkeleton />;
    case 'error':
      return <ErrorState error={state.error} onRetry={onRetry} />;
    case 'success': {
      const report = state.data;
      return (
        <div className={styles.grid}>
          <div className={styles.current}>
            <CurrentWeather place={place} report={report} today={report.daily[0]} units={units} />
          </div>
          <div className={styles.hourly}>
            <HourlyStrip hours={report.hourly} units={units} />
          </div>
          <div className={styles.daily}>
            <Forecast days={report.daily} units={units} />
          </div>
        </div>
      );
    }
  }
}
