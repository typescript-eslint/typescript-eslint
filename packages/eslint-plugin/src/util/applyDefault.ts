import { deepMerge, isObjectNotArray } from './deepMerge';

/**
 * Pure function - doesn't mutate either parameter!
 * Uses the default options and overrides with the options provided by the user
 * @param defaultOptions the defaults
 * @param userOptions the user opts
 * @returns the options with defaults
 */
export function applyDefault<TUser extends any[], TDefault extends TUser>(
  defaultOptions: TDefault,
  userOptions: TUser | null
): TDefault {
  // clone defaults
  const options: TDefault = JSON.parse(JSON.stringify(defaultOptions));

  if (userOptions === null || userOptions === undefined) {
    return options;
  }

  options.forEach((opt, i) => {
    if (userOptions[i]) {
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
