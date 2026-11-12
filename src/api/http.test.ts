import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppError } from './errors';
import { getJson } from './http';

const url = new URL('https://example.test/data');
const identity = (body: unknown) => body;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getJson', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: 1 }), { status: 200 })));
    await expect(getJson(url, identity)).resolves.toEqual({ ok: 1 });
  });

  it('turns HTTP errors into AppError with status and provider reason', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: true, reason: 'Bad latitude' }), { status: 400 })),
    );
    await expect(getJson(url, identity)).rejects.toMatchObject({ kind: 'http', status: 400, detail: 'Bad latitude' });
  });

  it('turns transport failures into a network AppError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(getJson(url, identity)).rejects.toBeInstanceOf(AppError);
    await expect(getJson(url, identity)).rejects.toMatchObject({ kind: 'network' });
  });

  it('propagates caller cancellation untouched so hooks can ignore it', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: URL, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        });
      }),
    );
    const pending = getJson(url, identity, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('reports a timeout distinctly from a network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: URL, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'TimeoutError')));
        });
      }),
    );
    await expect(getJson(url, identity, { timeoutMs: 10 })).rejects.toMatchObject({ kind: 'timeout' });
  });
});
