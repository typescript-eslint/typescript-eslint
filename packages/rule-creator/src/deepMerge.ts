// TODO: Dedupe from utils/src/eslint-utils? Separate package?

export type ObjectLike<T = unknown> = Record<string, T>;

/**
 * Check if the variable contains an object strictly rejecting arrays
 * @returns `true` if obj is an object
 */
export function isObjectNotArray(obj: unknown): obj is ObjectLike {
  return typeof obj === 'object' && obj != null && !Array.isArray(obj);
}

/**
 * Pure function - doesn't mutate either parameter!
 * Merges two objects together deeply, overwriting the properties in first with the properties in second
 * @param first The first object
 * @param second The second object
 * @returns a new object
 */
export function deepMerge(
  first: ObjectLike = {},
  second: ObjectLike = {},
): Record<string, unknown> {
  // get the unique set of keys across both objects
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);

  return Object.fromEntries(
    [...keys].map(key => {
      const firstHasKey = key in first;
      const secondHasKey = key in second;
      const firstValue = first[key];
      const secondValue = second[key];

      let value;
      if (firstHasKey && secondHasKey) {
        if (isObjectNotArray(firstValue) && isObjectNotArray(secondValue)) {
          // object type
          value = deepMerge(firstValue, secondValue);
        } else {
          // value type
          value = secondValue;
        }
      } else if (firstHasKey) {
        value = firstValue;
      } else {
        value = secondValue;
      }
      return [key, value];
    }),
  );
}
