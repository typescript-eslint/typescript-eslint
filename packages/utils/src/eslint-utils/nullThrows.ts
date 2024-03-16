/**
 * A set of common reasons for calling nullThrows
 */
const NullThrowsReasons = {
  MissingParent: 'Expected node to have a parent.',
  MissingToken: (token: string, thing: string) =>
    `Expected to find a ${token} for the ${thing}.`,
} as const;

/**
 * Assert that a value must not be null or undefined.
 * This is a nice explicit alternative to the non-null assertion operator.
 */
function nullThrows<T>(value: T, message: string): NonNullable<T> {
  if (value == null) {
    throw new Error(`Non-null Assertion Failed: ${message}`);
  }

  return value;
}

export { nullThrows, NullThrowsReasons };
