/**
 * Freezes a given value deeply.
 */
export function freezeDeeply(x: unknown): void {
  if (typeof x === 'object' && x != null) {
    if (Array.isArray(x)) {
      x.forEach(freezeDeeply);
    } else {
      for (const key in x) {
        if (key !== 'parent' && Object.prototype.hasOwnProperty.call(x, key)) {
          freezeDeeply((x as Record<string, unknown>)[key]);
        }
      }
    }
    Object.freeze(x);
  }
}
