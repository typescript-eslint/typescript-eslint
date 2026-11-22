/**
 * Clones a given value deeply.
 * Note: This ignores `parent` property.
 */
export function cloneDeeplyExcludesParent<T>(x: T): T {
  if (typeof x === 'object' && x != null) {
    if (Array.isArray(x)) {
      return x.map(cloneDeeplyExcludesParent) as T;
    }

    const retv = {} as typeof x;

    for (const key in x) {
      if (key !== 'parent' && Object.hasOwn(x, key)) {
        retv[key] = cloneDeeplyExcludesParent(x[key]);
      }
    }

    return retv;
  }

  return x;
}

/**
 * Checks, without allocating, that `assert.deepStrictEqual(clone, cloneDeeplyExcludesParent(x))` would pass,
 * where `clone` is itself a result of `cloneDeeplyExcludesParent`.
 * It may return `false` for some equal inputs (e.g. sparse arrays), so callers should fall back to the full comparison.
 */
export function isEqualToCloneExcludingParent(
  clone: unknown,
  x: unknown,
): boolean {
  if (typeof x !== 'object' || x == null) {
    return Object.is(clone, x);
  }
  if (typeof clone !== 'object' || clone == null) {
    return false;
  }

  if (Array.isArray(x)) {
    if (!Array.isArray(clone) || clone.length !== x.length) {
      return false;
    }
    for (let i = 0; i < x.length; i++) {
      if (
        !(i in x) ||
        !(i in clone) ||
        !isEqualToCloneExcludingParent(clone[i], x[i])
      ) {
        return false;
      }
    }
    return true;
  }

  if (Array.isArray(clone)) {
    return false;
  }

  const cloneRecord = clone as Record<string, unknown>;
  const record = x as Record<string, unknown>;
  let keyCount = 0;

  for (const key in record) {
    if (key !== 'parent' && Object.hasOwn(record, key)) {
      if (
        !Object.hasOwn(cloneRecord, key) ||
        !isEqualToCloneExcludingParent(cloneRecord[key], record[key])
      ) {
        return false;
      }
      keyCount++;
    }
  }

  return keyCount === Object.keys(cloneRecord).length;
}
