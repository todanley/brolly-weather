/**
 * Error types. Every failure that reaches the UI is normalised into an
 * AppError so components can render a message and decide whether to offer a
 * Retry without inspecting raw fetch/DOM errors.
 *
 * Note: "no search results" is NOT an error — it is a successful empty result.
 */
export type AppErrorKind =
  | 'offline'
  | 'network'
  | 'timeout'
  | 'http'
  | 'invalid-response'
  | 'geolocation-denied'
  | 'geolocation-unavailable'
  | 'geolocation-unsupported';

const RETRYABLE: ReadonlySet<AppErrorKind> = new Set<AppErrorKind>([
  'offline',
  'network',
  'timeout',
  'http',
  'geolocation-unavailable',
]);

interface AppErrorOptions {
  status?: number;
  detail?: string;
  cause?: unknown;
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly detail?: string;

  constructor(kind: AppErrorKind, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.kind = kind;
    this.status = options.status;
    this.detail = options.detail;
  }

  get retryable(): boolean {
    if (this.kind === 'http' && this.status !== undefined) {
      return this.status >= 500 || this.status === 429 || this.status === 408;
    }
    return RETRYABLE.has(this.kind);
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError('network', 'Something went wrong. Please try again.', { cause: error });
}

export interface ErrorCopy {
  title: string;
  description: string;
}

export function describeError(error: AppError): ErrorCopy {
  switch (error.kind) {
    case 'offline':
      return {
        title: 'You appear to be offline',
        description: 'Check your internet connection, then try again.',
      };
    case 'network':
      return {
        title: 'Couldn’t reach the weather service',
        description: 'The request didn’t complete. This is usually a temporary connection problem.',
      };
    case 'timeout':
      return {
        title: 'The weather service is taking too long',
        description: 'The request timed out. Please try again in a moment.',
      };
    case 'http':
      return {
        title: error.retryable ? 'The weather service is having trouble' : 'The request was rejected',
        description: error.detail
          ? `${error.detail}${error.status ? ` (HTTP ${error.status})` : ''}`
          : `The server responded with HTTP ${error.status ?? 'error'}.`,
      };
    case 'invalid-response':
      return {
        title: 'Unexpected data from the weather service',
        description: 'The response was not in the expected format.',
      };
    case 'geolocation-denied':
      return {
        title: 'Location access is blocked',
        description: 'Allow location access for this site in your browser settings, or search for a place instead.',
      };
    case 'geolocation-unavailable':
      return {
        title: 'Couldn’t determine your location',
        description: 'Your device didn’t return a position in time. Try again or search for a place.',
      };
    case 'geolocation-unsupported':
      return {
        title: 'Location isn’t available in this browser',
        description: 'Search for a place instead.',
      };
  }
}
