import type { UnitSystem } from '../types/weather';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'brolly:units:v1';

function isUnitSystem(value: unknown): value is UnitSystem {
  return value === 'metric' || value === 'imperial';
}

export function useUnits() {
  return useLocalStorage<UnitSystem>(STORAGE_KEY, 'metric', isUnitSystem);
}
