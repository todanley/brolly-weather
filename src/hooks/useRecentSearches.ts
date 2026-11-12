import { useCallback } from 'react';
import type { Place } from '../types/weather';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'brolly:recent-searches:v1';
export const MAX_RECENT_SEARCHES = 5;

function isPlace(value: unknown): value is Place {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Place>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number'
  );
}

function isPlaceList(value: unknown): value is Place[] {
  return Array.isArray(value) && value.every(isPlace);
}

export function addRecent(list: Place[], place: Place): Place[] {
  return [place, ...list.filter((existing) => existing.id !== place.id)].slice(0, MAX_RECENT_SEARCHES);
}

export function useRecentSearches() {
  const [recent, setRecent] = useLocalStorage<Place[]>(STORAGE_KEY, [], isPlaceList);

  const add = useCallback((place: Place) => setRecent((list) => addRecent(list, place)), [setRecent]);
  const remove = useCallback(
    (id: string) => setRecent((list) => list.filter((place) => place.id !== id)),
    [setRecent],
  );
  const clear = useCallback(() => setRecent([]), [setRecent]);

  return { recent, add, remove, clear };
}
