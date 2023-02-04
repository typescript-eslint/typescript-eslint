import type { CacheDurationSeconds } from '@typescript-eslint/types';

export const DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS = 30;
const ZERO_HR_TIME: [number, number] = [0, 0];

/**
 * A map with key-level expiration.
 */
export class ExpiringCache<TKey, TValue> {
  readonly #cacheDurationSeconds: CacheDurationSeconds;

  readonly #map = new Map<
    TKey,
    Readonly<{
      value: TValue;
      lastSeen: [number, number];
    }>
  >();

  constructor(cacheDurationSeconds: CacheDurationSeconds) {
    this.#cacheDurationSeconds = cacheDurationSeconds;
  }

  set(key: TKey, value: TValue): this {
    this.#map.set(key, {
      value,
      lastSeen:
        this.#cacheDurationSeconds === 'Infinity'
          ? // no need to waste time calculating the hrtime in infinity mode as there's no expiry
            ZERO_HR_TIME
          : process.hrtime(),
    });
    return this;
  }

  get(key: TKey): TValue | undefined {
    const entry = this.#map.get(key);
    if (entry?.value != null) {
      if (this.#cacheDurationSeconds === 'Infinity') {
        return entry.value;
      }

      const ageSeconds = process.hrtime(entry.lastSeen)[0];
      if (ageSeconds < this.#cacheDurationSeconds) {
        // cache hit woo!
        return entry.value;
      } else {
        // key has expired - clean it up to free up memory
        this.#map.delete(key);
      }
    }
    // no hit :'(
    return undefined;
  }

  clear(): void {
    this.#map.clear();
  }
}
