import { AppError } from './errors';

/**
 * Minimal runtime guards for untrusted JSON. A schema library (e.g. zod) would
 * be the choice in a larger codebase; for a handful of fields these keep the
 * bundle and dependency list small while still failing loudly and typed.
 */

type Json = Record<string, unknown>;

function invalid(path: string): AppError {
  return new AppError('invalid-response', `Invalid response at "${path}"`);
}

export function asRecord(value: unknown, path: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(path);
  return value as Json;
}

export function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(path);
  return value;
}

export function asNullableNumber(value: unknown, path: string): number | null {
  if (value === null || value === undefined) return null;
  return asNumber(value, path);
}

export function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') throw invalid(path);
  return value;
}

export function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw invalid(path);
  return value;
}

export function asArrayOf<T>(
  value: unknown,
  path: string,
  read: (item: unknown, itemPath: string) => T,
): T[] {
  return asArray(value, path).map((item, index) => read(item, `${path}[${index}]`));
}
