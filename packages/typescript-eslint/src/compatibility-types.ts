/*
 * This file contains types that are intentionally wide/inaccurate, that
 * historically existed for the purpose of satisfying both `defineConfig()` and
 * `tseslint.config()`. See https://github.com/typescript-eslint/typescript-eslint/issues/10899
 *
 * As of https://github.com/typescript-eslint/typescript-eslint/issues/11543,
 * the `FlatConfig.*` types from `@typescript-eslint/utils` are compatible with
 * `defineConfig()` directly, so these are no longer used by our own exports.
 */

/** @deprecated Use `FlatConfig.Parser` from `@typescript-eslint/utils/ts-eslint` instead. */
export interface CompatibleParser {
  parseForESLint(text: string): {
    ast: unknown;
    scopeManager: unknown;
  };
}

/** @deprecated Use `FlatConfig.Config` from `@typescript-eslint/utils/ts-eslint` instead. */
export interface CompatibleConfig {
  name?: string;
  rules?: object;
}

/** @deprecated Use `FlatConfig.ConfigArray` from `@typescript-eslint/utils/ts-eslint` instead. */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export type CompatibleConfigArray = CompatibleConfig[];

/** @deprecated Use `FlatConfig.Plugin` from `@typescript-eslint/utils/ts-eslint` instead. */
export interface CompatiblePlugin {
  meta: {
    name: string;
  };
}
