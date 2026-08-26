// @ts-check

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import vitestPlugin from '@vitest/eslint-plugin';
import deprecationPlugin from 'eslint-plugin-deprecation';
import tseslint from 'typescript-eslint';

import __dirname from './dirname.cjs';

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {},
});

// third-party values typed against @types/eslint v8 are no longer assignable
// to the re-anchored flat config plugin types
/** @type {any} */
const v8TypedJsRecommended = js.configs.recommended;
/** @type {any} */
const v8TypedStylisticRecommendedFlat =
  stylisticPlugin.configs['recommended-flat'];
/** @type {any} */
const v8TypedStylisticPlugin = stylisticPlugin;
/** @type {any} */
const v8TypedVitestPlugin = vitestPlugin;
/** @type {any} */
const v8TypedVitestRecommended = vitestPlugin.configs.recommended;

// this config is run through eslint as part of the integration test
// so it needs to be a correct config
export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
  },
  {
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
      ['vitest']: v8TypedVitestPlugin,
    },
  },
  v8TypedJsRecommended,
  ...tseslint.configs.recommended,
  v8TypedStylisticRecommendedFlat,
);

// wrapped in a function so they aren't executed at lint time
function _otherCases() {
  // these are just tests for the types and are not seen by eslint so they can be whatever
  tseslint.config({
    plugins: {
      // third-party values typed against @types/eslint v8 are no longer
      // assignable to the re-anchored flat config plugin types
      /** @type {any} */
      ['@stylistic']: stylisticPlugin,
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
      ['vitest']: v8TypedVitestPlugin,
    },
  });
  tseslint.config(
    v8TypedJsRecommended,
    ...tseslint.configs.recommended,
    v8TypedStylisticRecommendedFlat,
    v8TypedVitestRecommended,
  );
  tseslint.config(
    // @ts-expect-error
    compat.config(deprecationPlugin.configs.recommended),
    v8TypedVitestRecommended,
  );
  tseslint.config(
    // @ts-expect-error
    deprecationPlugin.configs.recommended,
    v8TypedVitestRecommended,
  );
}
