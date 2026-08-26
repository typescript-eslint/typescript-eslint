/*
 * Types for values that need to satisfy both `defineConfig()` and
 * `tseslint.config()`.
 *
 * These used to be intentionally wide/inaccurate to paper over the gap between
 * our types and ESLint's (see
 * https://github.com/typescript-eslint/typescript-eslint/issues/10899).
 * Our flat-config types are now anchored on `@eslint/core`, so the compatible
 * types are aliases of the re-anchored types (see
 * https://github.com/typescript-eslint/typescript-eslint/issues/11543).
 */
import type { TSESLint } from '@typescript-eslint/utils';

export type CompatibleParser = TSESLint.FlatConfig.Parser;

export type CompatibleConfig = TSESLint.FlatConfig.Config;

export type CompatibleConfigArray = TSESLint.FlatConfig.ConfigArray;

export type CompatiblePlugin = TSESLint.FlatConfig.Plugin;
