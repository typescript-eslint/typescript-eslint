export function shallowEqual(
  object1: object | undefined | null,
  object2: object | undefined | null,
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
    if (object1![key] !== object2![key]) {
      return false;
    }
  }
  return true;
}
