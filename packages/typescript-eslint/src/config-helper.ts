/*
This package is consumed from js config files with @ts-check. Often times these
files are not covered by a tsconfig.json -- meaning they use the default
`node10` module resolution.

In order to support this use-case we need to ensure this package's module
signature is compatible with `node10` resolution. If we use `/utils/ts-eslint`
here then we need to make sure that that import works in `node10` -- which is a
pain because `node10` is "simple" and just maps to the files on disk.

So to avoid that problem entirely we use the root import which is easy to make
`node10` compatible.

For more context see:
https://github.com/typescript-eslint/typescript-eslint/pull/8460

TODO - convert this to /utils/ts-eslint
*/
import type { TSESLint } from '@typescript-eslint/utils';

export type InfiniteDepthConfigWithExtends =
  | ConfigWithExtends
  | InfiniteDepthConfigWithExtends[];

export interface ConfigWithExtends extends TSESLint.FlatConfig.Config {
  /**
   * Allows you to "extend" a set of configs similar to `extends` from the
   * classic configs.
   *
   * This is just a convenience short-hand to help reduce duplication.
   *
   * ```js
   * export default tseslint.config({
   *   files: ['** /*.ts'],
   *   extends: [
   *     eslint.configs.recommended,
   *     tseslint.configs.recommended,
   *   ],
   *   rules: {
   *     '@typescript-eslint/array-type': 'error',
   *     '@typescript-eslint/consistent-type-imports': 'error',
   *   },
   * })
   *
   * // expands to
   *
   * export default [
   *   {
   *     ...eslint.configs.recommended,
   *     files: ['** /*.ts'],
   *   },
   *   ...tseslint.configs.recommended.map(conf => ({
   *     ...conf,
   *     files: ['** /*.ts'],
   *   })),
   *   {
   *     files: ['** /*.ts'],
   *     rules: {
   *       '@typescript-eslint/array-type': 'error',
   *       '@typescript-eslint/consistent-type-imports': 'error',
   *     },
   *   },
   * ]
   * ```
   */
  extends?: InfiniteDepthConfigWithExtends[];
}

// exported so that users that make configs with tsconfig `declaration: true` can name the type
export type ConfigArray = TSESLint.FlatConfig.ConfigArray;
type Config = TSESLint.FlatConfig.Config;

/**
 * Utility function to make it easy to strictly type your "Flat" config file
 * @example
 * ```js
 * // @ts-check
 *
 * import eslint from '@eslint/js';
 * import tseslint from 'typescript-eslint';
 *
 * export default tseslint.config(
 *   eslint.configs.recommended,
 *   tseslint.configs.recommended,
 *   {
 *     rules: {
 *       '@typescript-eslint/array-type': 'error',
 *     },
 *   },
 * );
 * ```
 */
export function config(
  ...configs: InfiniteDepthConfigWithExtends[]
): ConfigArray {
  return configWithoutAssumptions(configs);
}

function isObject(value: unknown): value is object {
  // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish, eqeqeq
  return typeof value === 'object' && value !== null;
}

// Implement the `config()` helper without assuming the runtime type of the input.
function configWithoutAssumptions(configs: unknown[]): ConfigArray {
  const flattened = configs.flat(Infinity);
  return flattened.flatMap((configWithExtends, configIndex) => {
    if (!isObject(configWithExtends) || !('extends' in configWithExtends)) {
      // `configWithExtends` could be anything, but we'll assume it's a `Config` object for TS purposes.
      return configWithExtends as Config;
    }
    const {
      extends: extendsArr,
      ...config
    }: { extends: unknown } & Partial<
      Record<'files' | 'ignores' | 'name', unknown>
    > = configWithExtends;
    const { name } = config;
    const nameIsString = typeof name === 'string';
    const extendsError = (expected: string) =>
      new TypeError(
        `tseslint.config(): Config ${
          nameIsString ? `"${name}"` : '(anonymous)'
        }: Key "extends": Expected ${expected} at user-defined index ${configIndex}.`,
      );
    if (!Array.isArray(extendsArr)) {
      throw extendsError('value to be an array');
    }

    return [
      ...extendsArr.flat(Infinity).map(extension => {
        if (!isObject(extension)) {
          throw extendsError('array to only contain objects');
        }
        const mergedName = [
          nameIsString && name,
          'name' in extension && extension.name,
        ]
          .filter(Boolean)
          .join('__');
        return {
          // `extension` could be any object, but we'll assume it's a `Config` object for TS purposes.
          ...(extension as Config),
          ...Object.fromEntries(
            Object.entries(config).filter(
              ([key, value]) =>
                ['files', 'ignores'].includes(key) &&
                // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
                value !== undefined,
            ),
          ),
          ...(mergedName && { name: mergedName }),
        };
      }),
      // `config` could be any object, but we'll assume it's a `Config` object for TS purposes.
      config as Config,
    ];
  });
}
