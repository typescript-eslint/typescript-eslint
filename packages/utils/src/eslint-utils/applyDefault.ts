import { deepMerge, isObjectNotArray } from './deepMerge';

/**
 * Pure function - doesn't mutate either parameter!
 * Uses the default options and overrides with the options provided by the user
 * @param defaultOptions the defaults
 * @param userOptions the user opts
 * @returns the options with defaults
 */
function applyDefault<TUser extends readonly unknown[], TDefault extends TUser>(
  defaultOptions: Readonly<TDefault>,
  userOptions: Readonly<TUser> | null,
): TDefault {
  // clone defaults
  const options = JSON.parse(
    JSON.stringify(defaultOptions),
  ) as AsMutable<TDefault>;

  if (userOptions === null || userOptions === undefined) {
    return options;
  }

  // For avoiding the type error
  //   `This expression is not callable. Type 'unknown' has no call signatures.ts(2349)`
  // @ts-ignore
  (options as unknown[]).forEach((opt: unknown, i: number) => {
    if (userOptions[i] !== undefined) {
      const userOpt = userOptions[i];

      if (isObjectNotArray(userOpt) && isObjectNotArray(opt)) {
        options[i] = deepMerge(opt, userOpt);
      } else {
        options[i] = userOpt;
      }
    }
  });

  return options;
}

type AsMutable<T extends readonly unknown[]> = {
  -readonly [TKey in keyof T]: T[TKey];
};

export { applyDefault };
