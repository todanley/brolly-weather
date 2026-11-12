import { describe, expect, it } from 'vitest';
import { AppError, describeError } from './errors';

describe('AppError.retryable', () => {
  it('retries transient failures', () => {
    expect(new AppError('network', 'x').retryable).toBe(true);
    expect(new AppError('timeout', 'x').retryable).toBe(true);
    expect(new AppError('http', 'x', { status: 503 }).retryable).toBe(true);
    expect(new AppError('http', 'x', { status: 429 }).retryable).toBe(true);
  });

  it('does not offer retry when repeating cannot help', () => {
    expect(new AppError('http', 'x', { status: 400 }).retryable).toBe(false);
    expect(new AppError('invalid-response', 'x').retryable).toBe(false);
    expect(new AppError('geolocation-denied', 'x').retryable).toBe(false);
  });
});

describe('describeError', () => {
  it('surfaces the provider reason for HTTP errors', () => {
    const copy = describeError(new AppError('http', 'x', { status: 400, detail: 'Latitude out of range' }));
    expect(copy.description).toBe('Latitude out of range (HTTP 400)');
  });
});
