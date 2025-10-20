/*
 * This file contains types that are intentionally wide/inaccurate, that exist
 * for the purpose of satisfying both `defineConfig()` and `tseslint.config()`.
 * See https://github.com/typescript-eslint/typescript-eslint/issues/10899
 */

export interface CompatibleParser {
  parseForESLint(text: string): {
    ast: unknown;
    scopeManager: unknown;
  };
}

export interface CompatibleConfig {
  name?: string;
  rules?: object;
}

export type CompatibleConfigArray = CompatibleConfig[];

export interface CompatiblePlugin {
  meta: {
    name: string;
  };
}
