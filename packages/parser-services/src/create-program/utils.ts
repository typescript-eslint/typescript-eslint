/**
 * Like `forEach`, but suitable for use with numbers and strings (which may be falsy).
 * @todo Switch to .find()?
 */
export function firstDefined<T, U>(
  array: readonly T[] | undefined,
  callback: (element: T, index: number) => U | undefined,
): U | undefined {
  // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
  if (array === undefined) {
    return undefined;
  }

  for (let i = 0; i < array.length; i++) {
    const result = callback(array[i], i);
    // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}
