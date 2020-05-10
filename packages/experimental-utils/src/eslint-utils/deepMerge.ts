type ObjectLike<T = unknown> = Record<string, T>;

/**
 * Check if the variable contains an object strictly rejecting arrays
 * @param obj an object
 * @returns `true` if obj is an object
 */
function isObjectNotArray<T extends ObjectLike>(
  obj: unknown | unknown[],
): obj is T {
  return typeof obj === 'object' && !Array.isArray(obj);
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
  const keys = new Set(Object.keys(first).concat(Object.keys(second)));

  return Array.from(keys).reduce<ObjectLike>((acc, key) => {
    const firstHasKey = key in first;
    const secondHasKey = key in second;
    const firstValue = first[key];
    const secondValue = second[key];

    if (firstHasKey && secondHasKey) {
      if (isObjectNotArray(firstValue) && isObjectNotArray(secondValue)) {
        // object type
        acc[key] = deepMerge(firstValue, secondValue);
      } else {
        // value type
        acc[key] = secondValue;
      }
    } else if (firstHasKey) {
      acc[key] = firstValue;
    } else {
      acc[key] = secondValue;
    }

    return acc;
  }, {});
}

export { isObjectNotArray };
