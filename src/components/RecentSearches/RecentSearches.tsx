import { History, X } from 'lucide-react';
import type { Place } from '../../types/weather';
import styles from './RecentSearches.module.css';

interface RecentSearchesProps {
  places: Place[];
  activePlaceId?: string;
  onSelect: (place: Place) => void;
  onRemove: (id: string) => void;
}

export function RecentSearches({ places, activePlaceId, onSelect, onRemove }: RecentSearchesProps) {
  if (places.length === 0) return null;

  return (
    <nav className={styles.root} aria-label="Recent searches">
      <History className={styles.icon} size={16} aria-hidden="true" />
      <ul className={styles.list}>
        {places.map((place) => (
          <li key={place.id} className={styles.chip} data-active={place.id === activePlaceId}>
            <button
              type="button"
              className={styles.chipButton}
              onClick={() => onSelect(place)}
              aria-current={place.id === activePlaceId ? 'true' : undefined}
              title={[place.name, place.admin1, place.country].filter(Boolean).join(', ')}
            >
              {place.name}
              {place.countryCode && <span className={styles.code}>{place.countryCode}</span>}
            </button>
            <button
              type="button"
              className={styles.remove}
              onClick={() => onRemove(place.id)}
              aria-label={`Remove ${place.name} from recent searches`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
