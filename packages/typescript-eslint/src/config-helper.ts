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

interface ConfigWithExtends extends TSESLint.FlatConfig.Config {
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
  extends?: TSESLint.FlatConfig.ConfigArray;
}

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
  ...configs: ConfigWithExtends[]
): TSESLint.FlatConfig.ConfigArray {
  return configs.flatMap(configWithExtends => {
    const { extends: extendsArr, ...config } = configWithExtends;
    if (extendsArr == null || extendsArr.length === 0) {
      return config;
    }

    if (config.files) {
      const files = config.files;
      return [
        ...extendsArr.map(conf => ({ ...conf, files: [...files] })),
        config,
      ];
    }

    return [...extendsArr, config];
  });
}
