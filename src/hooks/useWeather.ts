import { useCallback } from 'react';
import { getWeatherReport } from '../api/openMeteo';
import type { Place, WeatherReport } from '../types/weather';
import { useAbortableQuery, type QueryResult } from './useAbortableQuery';

/** ~100 m precision: nearby duplicates share a key, distinct places don't. */
function coordinateKey(place: Place): string {
  return `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;
}

export function useWeather(place: Place | null): QueryResult<WeatherReport> {
  const key = place ? coordinateKey(place) : null;
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      if (!place) return Promise.reject(new Error('No place selected'));
      return getWeatherReport(place, { signal });
    },
    [place],
  );
  return useAbortableQuery(key, fetcher);
}
