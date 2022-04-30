/**
 * Helper function to get only the keys of an enum.
 *
 * (By default, TypeScript will put the values inside of the keys of a
 * number-based enum, so those have to be filtered out.)
 *
 * This function will work properly for both number and string enums.
 */
function getEnumNames<T extends string>(
  transpiledEnum: Record<T, unknown>,
): T[] {
  const keys = Object.keys(transpiledEnum);
  return keys.filter(x => isNaN(parseInt(x, 10))) as T[];
}

/**
 * Helper function to get the only the values of an enum.
 *
 * (By default, TypeScript will put the keys inside of the values of a
 * number-based enum, so those have to be filtered out.)
 *
 * This function will work properly for both number and string enums.
 */
function getEnumValues<T>(transpiledEnum: Record<string, string | T>): T[] {
  const values = Object.values(transpiledEnum);
  const numberValues = values.filter(value => typeof value === 'number');

  // If there are no number values, then this must be a string enum, and no filtration is required
  const valuesToReturn = numberValues.length > 0 ? numberValues : values;
  return valuesToReturn as T[];
}

export { getEnumNames, getEnumValues };
