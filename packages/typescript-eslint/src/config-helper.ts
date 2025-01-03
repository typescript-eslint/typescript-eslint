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
   *     ...tseslint.configs.recommended,
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
 *   ...tseslint.configs.recommended,
 *   {
 *     rules: {
 *       '@typescript-eslint/array-type': 'error',
 *     },
 *   },
 * );
 * ```
 */
export const config = (
  ...configs: InfiniteDepthConfigWithExtends[]
): ConfigArray => configWithoutAssumptions(configs);
function configWithoutAssumptions(configs: unknown[]): ConfigArray {
  /* We intentionally temporarily change the type to `unknown`, to ensure that we make no assumptions about the types of
  the arguments passed to this function at runtime. If any argument is an unexpected type, we should not cause a
  `TypeError`, and instead, we should silently return the unexpected argument unchanged, because ESLint will later
   validate the types. */
  const flattened = configs.flat(Infinity);
  return flattened.flatMap((configWithExtends, configIndex) => {
    if (
      !configWithExtends ||
      typeof configWithExtends !== 'object' ||
      !('extends' in configWithExtends)
    ) {
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
    const configError = (message: string) =>
      new TypeError(
        `Config ${
          nameIsString ? `"${name}"` : '(unnamed)'
        }: Key "extends": ${message} at user-defined index ${configIndex}.`,
      );
    if (!Array.isArray(extendsArr)) {
      throw configError('Expected value to be an array');
    }
    const extendsArrFlattened: unknown[] = extendsArr.flat(Infinity);

    const undefinedExtensions = extendsArrFlattened.reduce<number[]>(
      (acc, extension, extensionIndex) => {
        if (extension == null) {
          acc.push(extensionIndex);
        }
        return acc;
      },
      [],
    );
    if (undefinedExtensions.length) {
      throw configError(
        `Undefined extensions at the following indices: ${undefinedExtensions.join(', ')}`,
      );
    }

    return [
      ...(extendsArrFlattened as { name?: unknown }[]).map(extension => {
        const mergedName = [nameIsString && name, extension.name]
          .filter(Boolean)
          .join('__');
        return {
          // `extension` could be any object, but we'll assume it's a `Config` object for TS purposes.
          ...(extension as Config),
          ...Object.fromEntries(
            Object.entries(config).filter(([key]) =>
              ['files', 'ignores'].includes(key),
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
