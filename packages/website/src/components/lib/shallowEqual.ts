import type { ConfigModel } from '@site/src/components/types';

export function shallowEqual(
  object1: Record<string, unknown> | ConfigModel | undefined,
  object2: Record<string, unknown> | ConfigModel | undefined,
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
