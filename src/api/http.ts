import { AppError } from './errors';

const DEFAULT_TIMEOUT_MS = 10_000;

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

function readErrorReason(body: unknown): string | undefined {
  if (typeof body === 'object' && body !== null && 'reason' in body) {
    const { reason } = body as { reason: unknown };
    if (typeof reason === 'string') return reason;
  }
  return undefined;
}

/**
 * The only place in the app that calls `fetch`.
 *
 * - Caller cancellation (AbortSignal) is propagated untouched as an AbortError
 *   so hooks can silently ignore superseded requests.
 * - A separate timeout signal turns hung requests into a typed `timeout` error.
 * - Transport, HTTP and parsing failures become typed AppErrors.
 * - `parse` validates the untrusted JSON and maps it to a domain type.
 */
export async function getJson<T>(
  url: URL,
  parse: (body: unknown) => T,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(url, { signal: combinedSignal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    if (timeoutSignal.aborted) {
      throw new AppError('timeout', 'Request timed out', { cause: error });
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new AppError('offline', 'Browser is offline', { cause: error });
    }
    throw new AppError('network', 'Network request failed', { cause: error });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    if (!response.ok) {
      throw new AppError('http', `HTTP ${response.status}`, { status: response.status, cause: error });
    }
    throw new AppError('invalid-response', 'Response was not valid JSON', { cause: error });
  }

  if (!response.ok) {
    throw new AppError('http', `HTTP ${response.status}`, {
      status: response.status,
      detail: readErrorReason(body),
    });
  }

  return parse(body);
}
