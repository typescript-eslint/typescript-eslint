/**
 * Shallowly compare two objects.
 */
export function shallowEqual(
  object1: object | null | undefined,
  object2: object | null | undefined,
): boolean {
  if (object1 === object2) {
    return true;
  }
  const keys1 = Object.keys(object1 ?? {});
  const keys2 = Object.keys(object2 ?? {});
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (object1![key] !== object2![key]) {
      return false;
    }
  }
  return true;
}
