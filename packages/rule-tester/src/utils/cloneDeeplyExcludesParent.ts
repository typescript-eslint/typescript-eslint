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
      if (key !== 'parent' && Object.prototype.hasOwnProperty.call(x, key)) {
        retv[key] = cloneDeeplyExcludesParent(x[key]);
      }
    }

    return retv;
  }

  return x;
}
