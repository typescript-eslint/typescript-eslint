export const DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS = 30;

/**
 * A map with key-level expiration.
 */
export class ExpiringCache<TKey, TValue> {
  readonly #cacheDurationSeconds: number | 'Infinity';
  /**
   * The mapping of path-like string to the resolved TSConfig(s)
   */
  protected map = new Map<
    TKey,
    Readonly<{
      value: TValue;
      lastSeen: [number, number];
    }>
  >();

  constructor(cacheDurationSeconds: number | 'Infinity') {
    this.#cacheDurationSeconds = cacheDurationSeconds;
  }

  set(key: TKey, value: TValue): void {
    this.map.set(key, {
      value,
      lastSeen:
        this.#cacheDurationSeconds === 'Infinity'
          ? // no need to waste time calculating the hrtime in infinity mode as there's no expiry
            [0, 0]
          : process.hrtime(),
    });
  }

  get(key: TKey): TValue | undefined {
    const entry = this.map.get(key);
    if (entry?.value != null) {
      const ageSeconds = process.hrtime(entry.lastSeen)[0];
      if (
        this.#cacheDurationSeconds === 'Infinity' ||
        ageSeconds < this.#cacheDurationSeconds
      ) {
        // cache hit woo!
        return entry.value;
      } else {
        // key has expired - clean it up to free up memory
        this.cleanupKey(key);
      }
    }
    // no hit :'(
    return undefined;
  }

  protected cleanupKey(key: TKey): void {
    this.map.delete(key);
  }

  get size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
}

/**
 * A map with key-level expiration where it is known that there will be multiple
 * keys with the same value.
 */
export class ExpiringCacheWithReverseMap<TKey, TValue> extends ExpiringCache<
  TKey,
  TValue
> {
  readonly #reverseMap = new Map<TValue, Set<TKey>>();

  override set(key: TKey, value: TValue): void {
    super.set(key, value);
    const reverseEntry = this.#reverseMap.get(value) ?? new Set();
    reverseEntry.add(key);
    this.#reverseMap.set(value, reverseEntry);
  }

  setAll(keys: readonly TKey[], value: TValue): void {
    for (const key of keys) {
      this.set(key, value);
    }
  }

  override cleanupKey(key: TKey): void {
    super.cleanupKey(key);

    // we know there are other keys in the cache that can also be cleaned up
    // so lookup the reverse map to find them all and delete them too
    const entry = this.map.get(key);
    const reverseMapKey = entry?.value;
    if (reverseMapKey != null) {
      const reverseEntry = this.#reverseMap.get(reverseMapKey);
      if (reverseEntry) {
        for (const expiredKey of reverseEntry) {
          this.map.delete(expiredKey);
        }
        this.#reverseMap.delete(reverseMapKey);
      }
    }
  }

  override clear(): void {
    super.clear();
    this.#reverseMap.clear();
  }
}
