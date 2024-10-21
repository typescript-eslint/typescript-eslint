import type { CacheDurationSeconds } from '@typescript-eslint/types';

export const DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS = 30;
const ZERO_HR_TIME: [number, number] = [0, 0];

export interface CacheLike<Key, Value> {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): this;
}

/**
 * A map with key-level expiration.
 */
export class ExpiringCache<Key, Value> implements CacheLike<Key, Value> {
  readonly #cacheDurationSeconds: CacheDurationSeconds;

  readonly #map = new Map<
    Key,
    Readonly<{
      lastSeen: [number, number];
      value: Value;
    }>
  >();

  constructor(cacheDurationSeconds: CacheDurationSeconds) {
    this.#cacheDurationSeconds = cacheDurationSeconds;
  }

  clear(): void {
    this.#map.clear();
  }

  get(key: Key): Value | undefined {
    const entry = this.#map.get(key);
    if (entry?.value != null) {
      if (this.#cacheDurationSeconds === 'Infinity') {
        return entry.value;
      }

      const ageSeconds = process.hrtime(entry.lastSeen)[0];
      if (ageSeconds < this.#cacheDurationSeconds) {
        // cache hit woo!
        return entry.value;
      }
      // key has expired - clean it up to free up memory
      this.#map.delete(key);
    }
    // no hit :'(
    return undefined;
  }

  set(key: Key, value: Value): this {
    this.#map.set(key, {
      lastSeen:
        this.#cacheDurationSeconds === 'Infinity'
          ? // no need to waste time calculating the hrtime in infinity mode as there's no expiry
            ZERO_HR_TIME
          : process.hrtime(),
      value,
    });
    return this;
  }
}
