import { useCallback, useEffect, useState } from 'react';
import styles from './App.module.css';
import { ErrorState } from './components/ErrorState/ErrorState';
import { LocationButton } from './components/LocationButton/LocationButton';
import { RecentSearches } from './components/RecentSearches/RecentSearches';
import { SearchBar } from './components/SearchBar/SearchBar';
import { UnitToggle } from './components/UnitToggle/UnitToggle';
import { WeatherView } from './components/WeatherView/WeatherView';
import { useGeolocation } from './hooks/useGeolocation';
import { useRecentSearches } from './hooks/useRecentSearches';
import { useUnits } from './hooks/useUnits';
import { useWeather } from './hooks/useWeather';
import type { Place } from './types/weather';
import { skyThemeFor } from './utils/sky';
import { formatTemperature } from './utils/units';

/**
 * Composition root: owns the few pieces of app-level state (selected place,
 * units, recents) and wires hooks to presentational components.
 */
export default function App() {
  const { recent, add: addRecent, remove: removeRecent } = useRecentSearches();
  const [place, setPlace] = useState<Place | null>(() => recent[0] ?? null);
  const [units, setUnits] = useUnits();
  const weather = useWeather(place);
  const geolocation = useGeolocation();
  const { dismiss: dismissGeolocationError, locate } = geolocation;

  const selectPlace = useCallback(
    (next: Place) => {
      setPlace(next);
      if (!next.isCurrentLocation) addRecent(next);
      dismissGeolocationError();
    },
    [addRecent, dismissGeolocationError],
  );

  const locateUser = useCallback(async () => {
    const coordinates = await locate();
    if (!coordinates) return;
    setPlace({
      id: `geo:${coordinates.latitude.toFixed(3)},${coordinates.longitude.toFixed(3)}`,
      name: 'Your location',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      isCurrentLocation: true,
    });
  }, [locate]);

  const report = weather.state.status === 'success' ? weather.state.data : null;

  useEffect(() => {
    document.documentElement.dataset.sky = report
      ? skyThemeFor(report.current.weatherCode, report.current.isDay)
      : 'neutral';
  }, [report]);

  useEffect(() => {
    document.title =
      report && place ? `${formatTemperature(report.current.temperatureC, units)} ${place.name} · Brolly` : 'Brolly · Weather';
  }, [report, place, units]);

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#main">
        Skip to weather
      </a>

      <header className={styles.header}>
        <div className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 17a11 11 0 0 1 22 0z" fill="currentColor" />
            <path d="M16 17v7a2.5 2.5 0 0 1-5 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className={styles.brandName}>Brolly</span>
        </div>
        <div className={styles.search}>
          <SearchBar onSelect={selectPlace} />
        </div>
        <div className={styles.locate}>
          <LocationButton isLocating={geolocation.state.status === 'locating'} onClick={locateUser} />
        </div>
        <div className={styles.units}>
          <UnitToggle value={units} onChange={setUnits} />
        </div>
      </header>

      <RecentSearches places={recent} activePlaceId={place?.id} onSelect={selectPlace} onRemove={removeRecent} />

      {geolocation.state.status === 'error' && (
        <ErrorState
          compact
          error={geolocation.state.error}
          onRetry={locateUser}
          onDismiss={dismissGeolocationError}
        />
      )}

      <main id="main" className={styles.main} aria-live="polite" aria-busy={weather.state.status === 'loading'}>
        <WeatherView
          place={place}
          state={weather.state}
          units={units}
          onRetry={weather.retry}
          onSelectPlace={selectPlace}
        />
      </main>

      <footer className={styles.footer}>
        <p>
          Weather data by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo.com
          </a>{' '}
          (CC BY 4.0). Times are shown in each location’s local time.
        </p>
      </footer>
    </div>
  );
}
