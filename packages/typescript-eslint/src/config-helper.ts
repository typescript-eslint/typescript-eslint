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
export function config(
  ...configs: InfiniteDepthConfigWithExtends[]
): ConfigArray {
  /* We intentionally temporarily change the type to `unknown`, to ensure that we make no assumptions about the types of
  the arguments passed to this function at runtime. If any argument is an unexpected type, we should not cause a
  `TypeError`, and instead, we should silently return the unexpected argument unchanged, because ESLint will later
   validate the types. */
  const flattened: unknown[] =
    // @ts-expect-error -- intentionally an infinite type
    configs.flat(Infinity);
  return flattened.flatMap((configWithExtends, configIndex) => {
    if (
      !configWithExtends ||
      typeof configWithExtends !== 'object' ||
      !('extends' in configWithExtends)
    ) {
      // `configWithExtends` could be anything, but we'll assume it's a `Config` object for TS purposes.
      return configWithExtends as Config;
    }
    const { extends: extendsArr, ...config } = configWithExtends as {
      extends: InfiniteDepthConfigWithExtends[];
      name?: unknown;
      files?: unknown;
      ignores?: unknown;
    };
    // `config` could be anything, but we'll assume it's a `Config` object for TS purposes.
    const configToReturn = config as Config;
    if (extendsArr.length === 0) {
      return configToReturn;
    }
    const extendsArrFlattened = extendsArr.flat(
      Infinity,
    ) as ConfigWithExtends[];

    const undefinedExtensions = extendsArrFlattened.reduce<number[]>(
      (acc, extension, extensionIndex) => {
        const maybeExtension = extension as Config | undefined;
        if (maybeExtension == null) {
          acc.push(extensionIndex);
        }
        return acc;
      },
      [],
    );
    if (undefinedExtensions.length) {
      const configName =
        config.name != null
          ? `, named "${
              // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions
              config.name
            }",`
          : ' (anonymous)';
      const extensionIndices = undefinedExtensions.join(', ');
      throw new Error(
        `Your config at index ${configIndex}${configName} contains undefined` +
          ` extensions at the following indices: ${extensionIndices}.`,
      );
    }

    return [
      ...extendsArrFlattened.map(extension => {
        const name = [config.name, extension.name].filter(Boolean).join('__');
        return {
          ...extension,
          ...Object.fromEntries(
            Object.entries(config).filter(([key]) =>
              ['files', 'ignores'].includes(key),
            ),
          ),
          ...(name && { name }),
        };
      }),
      configToReturn,
    ];
  });
}
