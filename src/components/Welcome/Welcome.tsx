import { CloudSun } from 'lucide-react';
import shared from '../../styles/shared.module.css';
import type { Place } from '../../types/weather';
import styles from './Welcome.module.css';

/** Geonames IDs match Open-Meteo geocoding results, so recents dedupe correctly. */
const SUGGESTED_PLACES: readonly Place[] = [
  { id: '2147714', name: 'Sydney', admin1: 'New South Wales', country: 'Australia', countryCode: 'AU', latitude: -33.86785, longitude: 151.20732 },
  { id: '1668341', name: 'Taipei', country: 'Taiwan', countryCode: 'TW', latitude: 25.04776, longitude: 121.53185 },
  { id: '1850147', name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6895, longitude: 139.69171 },
  { id: '2643743', name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.50853, longitude: -0.12574 },
  { id: '5128581', name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', latitude: 40.71427, longitude: -74.00597 },
];

interface WelcomeProps {
  onSelect: (place: Place) => void;
}

export function Welcome({ onSelect }: WelcomeProps) {
  return (
    <section className={`${shared.card} ${styles.root}`} aria-labelledby="welcome-heading">
      <CloudSun className={styles.icon} size={48} strokeWidth={1.4} aria-hidden="true" />
      <h1 id="welcome-heading" className={styles.title}>
        Look up a city
      </h1>
      <p className={styles.lead}>
        Search above, or use your current location, to see current conditions, the next 24 hours and a 7-day
        forecast.
      </p>
      <div className={styles.suggestions}>
        <span className={styles.suggestionsLabel}>Try</span>
        {SUGGESTED_PLACES.map((place) => (
          <button key={place.id} type="button" className={shared.ghostButton} onClick={() => onSelect(place)}>
            {place.name}
          </button>
        ))}
      </div>
    </section>
  );
}
