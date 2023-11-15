import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

interface ConfigWithExtends extends FlatConfig.Config {
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
   *     files: ['** /*.ts'],
   *     ...eslint.configs.recommended,
   *   },
   *   {
   *     files: ['** /*.ts'],
   *     ...tseslint.configs.recommended,
   *   },
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
  extends?: FlatConfig.ConfigArray;
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
 *   tseslint.configs.recommended,
 *   eslint.configs.recommended,
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
): FlatConfig.ConfigArray {
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
