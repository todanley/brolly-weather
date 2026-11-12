import { useCallback, useEffect, useState } from 'react';

/**
 * State mirrored to localStorage. Stored values are untrusted (older app
 * versions, manual edits), so they must pass `isValid` or the fallback is used.
 * Storage failures (private mode, quota) degrade to in-memory state.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): [T, (next: T | ((previous: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Persistence is best-effort; the in-memory value is still correct.
    }
  }, [key, value]);

  const update = useCallback((next: T | ((previous: T) => T)) => setValue(next), []);

  return [value, update];
}
