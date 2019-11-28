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
function nullThrows<T>(value: T | null | undefined, message: string): T {
  // this function is primarily used to keep types happy in a safe way
  // i.e. is used when we expect that a value is never nullish
  // this means that it's pretty much impossible to test the below if...

  // so ignore it in coverage metrics.
  /* istanbul ignore if */
  if (value === null || value === undefined) {
    throw new Error(`Non-null Assertion Failed: ${message}`);
  }

  return value;
}

export { nullThrows, NullThrowsReasons };
