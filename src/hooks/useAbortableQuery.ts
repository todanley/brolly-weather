import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppError, isAbortError, toAppError } from '../api/errors';
import type { AsyncState } from '../types/async';

type Action<T> =
  | { type: 'reset' }
  | { type: 'start' }
  | { type: 'resolve'; data: T }
  | { type: 'reject'; error: AppError };

function reducer<T>(_state: AsyncState<T>, action: Action<T>): AsyncState<T> {
  switch (action.type) {
    case 'reset':
      return { status: 'idle' };
    case 'start':
      return { status: 'loading' };
    case 'resolve':
      return { status: 'success', data: action.data };
    case 'reject':
      return { status: 'error', error: action.error };
  }
}

export interface QueryResult<T> {
  state: AsyncState<T>;
  retry: () => void;
}

/**
 * Runs `fetcher` whenever `key` changes and exposes the result as an
 * AsyncState. This is the one place that owns request lifecycles:
 *
 * - `key === null` means "nothing to fetch" → idle.
 * - A new key (or unmount) aborts the in-flight request, so a slow, stale
 *   response can never overwrite a newer one (no race conditions).
 * - `retry()` re-runs the current key without changing it.
 *
 * Deliberately tiny; TanStack Query would add caching, dedupe and background
 * refresh, which this app does not need at its current scope.
 */
export function useAbortableQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
): QueryResult<T> {
  const [state, dispatch] = useReducer(reducer<T>, { status: 'idle' } as AsyncState<T>);
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (key === null) {
      dispatch({ type: 'reset' });
      return;
    }

    const controller = new AbortController();
    dispatch({ type: 'start' });

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) dispatch({ type: 'resolve', data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        dispatch({ type: 'reject', error: toAppError(error) });
      });

    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { state, retry };
}
