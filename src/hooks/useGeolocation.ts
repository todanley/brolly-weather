import { useCallback, useState } from 'react';
import { AppError } from '../api/errors';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type GeolocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'error'; error: AppError };

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 5 * 60_000,
};

function toGeolocationError(error: GeolocationPositionError): AppError {
  if (error.code === error.PERMISSION_DENIED) {
    return new AppError('geolocation-denied', error.message, { cause: error });
  }
  return new AppError('geolocation-unavailable', error.message, { cause: error });
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const locate = useCallback((): Promise<Coordinates | null> => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({
        status: 'error',
        error: new AppError('geolocation-unsupported', 'Geolocation API not available'),
      });
      return Promise.resolve(null);
    }

    setState({ status: 'locating' });
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setState({ status: 'idle' });
          resolve({ latitude: coords.latitude, longitude: coords.longitude });
        },
        (error) => {
          setState({ status: 'error', error: toGeolocationError(error) });
          resolve(null);
        },
        POSITION_OPTIONS,
      );
    });
  }, []);

  const dismiss = useCallback(() => setState({ status: 'idle' }), []);

  return { state, locate, dismiss };
}
