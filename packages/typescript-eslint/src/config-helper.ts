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
   * The base path for files and ignores.
   *
   * @since eslint v9.30.0
   */
  basePath?: string;

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
  return configImpl(...configs);
}

// Implementation of the config function without assuming the runtime type of
// the input.
function configImpl(...configs: unknown[]): ConfigArray {
  const flattened = configs.flat(Infinity);
  return flattened.flatMap(
    (
      configWithExtends,
      configIndex,
    ): TSESLint.FlatConfig.Config | TSESLint.FlatConfig.Config[] => {
      if (
        configWithExtends == null ||
        typeof configWithExtends !== 'object' ||
        !('extends' in configWithExtends)
      ) {
        // Unless the object is a config object with extends key, just forward it
        // along to eslint.
        return configWithExtends as TSESLint.FlatConfig.Config;
      }

      const { extends: extendsArr, ..._config } = configWithExtends;
      const config = _config as {
        name?: unknown;
        extends?: unknown;
        files?: unknown;
        ignores?: unknown;
        basePath?: unknown;
      };

      if (extendsArr == null) {
        // If the extends value is nullish, just forward along the rest of the
        // config object to eslint.
        return config as TSESLint.FlatConfig.Config;
      }

      const name = ((): string | undefined => {
        if ('name' in configWithExtends && configWithExtends.name != null) {
          if (typeof configWithExtends.name !== 'string') {
            throw new Error(
              `tseslint.config(): Config at index ${configIndex} has a 'name' property that is not a string.`,
            );
          }
          return configWithExtends.name;
        }
        return undefined;
      })();
      const nameErrorPhrase =
        name != null ? `, named "${name}",` : ' (anonymous)';

      if (!Array.isArray(extendsArr)) {
        throw new TypeError(
          `tseslint.config(): Config at index ${configIndex}${nameErrorPhrase} has an 'extends' property that is not an array.`,
        );
      }

      const extendsArrFlattened = (extendsArr as unknown[]).flat(Infinity);

      const nonObjectExtensions = [];
      for (const [extensionIndex, extension] of extendsArrFlattened.entries()) {
        // special error message to be clear we don't support eslint's stringly typed extends.
        // https://eslint.org/docs/latest/use/configure/configuration-files#extending-configurations
        if (typeof extension === 'string') {
          throw new Error(
            `tseslint.config(): Config at index ${configIndex}${nameErrorPhrase} has an 'extends' array that contains a string (${JSON.stringify(extension)}) at index ${extensionIndex}.` +
              " This is a feature of eslint's `defineConfig()` helper and is not supported by typescript-eslint." +
              ' Please provide a config object instead.',
          );
        }
        if (extension == null || typeof extension !== 'object') {
          nonObjectExtensions.push(extensionIndex);
          continue;
        }

        // https://github.com/eslint/rewrite/blob/82d07fd0e8e06780b552a41f8bcbe2a4f8741d42/packages/config-helpers/src/define-config.js#L448-L450
        if ('basePath' in extension) {
          throw new TypeError(
            `tseslint.config(): Config at index ${configIndex}${nameErrorPhrase} has an 'extends' array that contains a config with a 'basePath' property at index ${extensionIndex}.` +
              ` 'basePath' in \`extends\' is not allowed.`,
          );
        }
      }
      if (nonObjectExtensions.length > 0) {
        const extensionIndices = nonObjectExtensions.join(', ');
        throw new TypeError(
          `tseslint.config(): Config at index ${configIndex}${nameErrorPhrase} contains non-object` +
            ` extensions at the following indices: ${extensionIndices}.`,
        );
      }

      const configArray = [];

      for (const _extension of extendsArrFlattened) {
        const extension = _extension as {
          name?: unknown;
          files?: unknown;
          ignores?: unknown;
        };

        const resolvedConfigName = [name, extension.name]
          .filter(Boolean)
          .join('__');
        if (isPossiblyGlobalIgnores(extension)) {
          // If it's a global ignores, then just pass it along
          configArray.push({
            ...extension,
            ...(resolvedConfigName !== '' ? { name: resolvedConfigName } : {}),
          });
        } else {
          configArray.push({
            ...extension,
            ...(config.files ? { files: config.files } : {}),
            ...(config.ignores ? { ignores: config.ignores } : {}),
            ...(config.basePath ? { basePath: config.basePath } : {}),
            ...(resolvedConfigName !== '' ? { name: resolvedConfigName } : {}),
          });
        }
      }

      // If the base config could form a global ignores object, then we mustn't include
      // it in the output. Otherwise, we must add it in order for it to have effect.
      if (!isPossiblyGlobalIgnores(config)) {
        configArray.push(config);
      }

      return configArray as ConfigArray;
    },
  );
}

/**
 * This utility function returns false if the config objects contains any field
 * that would prevent it from being considered a global ignores object and true
 * otherwise. Note in particular that the `ignores` field may not be present and
 * the return value can still be true.
 */
function isPossiblyGlobalIgnores(config: object): boolean {
  return Object.keys(config).every(key =>
    ['name', 'ignores', 'basePath'].includes(key),
  );
}
