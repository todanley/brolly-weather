import type { AppError } from '../api/errors';

/**
 * A single state machine for every remote resource in the app.
 * A discriminated union makes impossible states (e.g. data + error at once)
 * unrepresentable.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };
