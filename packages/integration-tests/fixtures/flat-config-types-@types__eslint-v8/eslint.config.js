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

// this config is run through eslint as part of the integration test
// so it needs to be a correct config
// Note: plugins and configs typed with @types/eslint@8 are no longer expected to
// be compatible with our types, as ESLint 8's function-style rules and
// `meta?: ... | undefined` rules are not assignable to ESLint 9+'s own rule
// types, which ours now match.
// See https://github.com/typescript-eslint/typescript-eslint/issues/11543
export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
  },
  {
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // @ts-expect-error -- see above
  stylisticPlugin.configs['recommended-flat'],
);

// wrapped in a function so they aren't executed at lint time
function _otherCases() {
  // these are just tests for the types and are not seen by eslint so they can be whatever
  tseslint.config({
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
    },
  });
  tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    // @ts-expect-error -- see above
    stylisticPlugin.configs['recommended-flat'],
    vitestPlugin.configs.recommended,
  );
  tseslint.config(
    // @ts-expect-error
    compat.config(deprecationPlugin.configs.recommended),
    vitestPlugin.configs.recommended,
  );
  tseslint.config(
    // @ts-expect-error
    deprecationPlugin.configs.recommended,
    vitestPlugin.configs.recommended,
  );
}
