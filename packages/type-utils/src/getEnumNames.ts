/**
 * Gets the keys of an enum.
 *
 * (By default, TypeScript will put the values inside of the keys of a
 * number-based enum, so those have to be filtered out.)
 *
 * This function will work properly for both number and string enums.
 */
export function getEnumNames<T extends string>(
  enumObject: Record<T, unknown>,
): T[] {
  const keys = Object.keys(enumObject);
  return keys.filter(x => isNaN(parseInt(x, 10))) as T[];
}
