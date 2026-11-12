import { useCallback } from 'react';
import { searchPlaces } from '../api/openMeteo';
import type { AsyncState } from '../types/async';
import type { Place } from '../types/weather';
import { useAbortableQuery } from './useAbortableQuery';
import { useDebouncedValue } from './useDebouncedValue';

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export interface GeocodingResult {
  state: AsyncState<Place[]>;
  /** True while the user is still typing and a new search has not started yet. */
  isPending: boolean;
  /** The query the current `state` belongs to. */
  searchedQuery: string;
  retry: () => void;
}

export function useGeocoding(query: string): GeocodingResult {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);
  const key = debounced.length >= MIN_QUERY_LENGTH ? debounced.toLowerCase() : null;

  const fetcher = useCallback((signal: AbortSignal) => searchPlaces(debounced, { signal }), [debounced]);
  const { state, retry } = useAbortableQuery(key, fetcher);

  return {
    state,
    isPending: trimmed.length >= MIN_QUERY_LENGTH && trimmed !== debounced,
    searchedQuery: debounced,
    retry,
  };
}
