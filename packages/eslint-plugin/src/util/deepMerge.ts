export type ObjectLike<T = any> = Record<string, T>;

/**
 * Check if the variable contains an object stricly rejecting arrays
 * @param obj an object
 * @returns `true` if obj is an object
 */
export function isObjectNotArray<T extends object>(obj: T | any[]): obj is T {
  return typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Pure function - doesn't mutate either parameter!
 * Merges two objects together deeply, overwriting the properties in first with the properties in second
 * @param first The first object
 * @param second The second object
 * @returns a new object
 */
export function deepMerge<T extends ObjectLike = ObjectLike>(
  first: ObjectLike = {},
  second: ObjectLike = {}
): T {
  // get the unique set of keys across both objects
  const keys = new Set(Object.keys(first).concat(Object.keys(second)));

  return Array.from(keys).reduce<T>(
    (acc, key) => {
      const firstHasKey = key in first;
      const secondHasKey = key in second;

      if (firstHasKey && secondHasKey) {
        if (isObjectNotArray(first[key]) && isObjectNotArray(second[key])) {
          // object type
          acc[key] = deepMerge(first[key], second[key]);
        } else {
          // value type
          acc[key] = second[key];
        }
      } else if (firstHasKey) {
        acc[key] = first[key];
      } else {
        acc[key] = second[key];
      }

      return acc;
    },
    {} as T
  );
}
